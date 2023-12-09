import React, { useEffect, useState } from 'react';
import { StatusBar, View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import Icon from 'react-native-vector-icons/FontAwesome'; // or any other icon library you prefer


function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();
const App = () => {
  const [userName, setUserName] = useState('');
  const [email, setUserEmail] = useState('');
  const [age, setUserAge] = useState('');
  const [users, setUsers] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState(null);



  const createTable = () => {
    db.transaction((txn) => {
      txn.executeSql('CREATE TABLE IF NOT EXISTS tbl_users (id INTEGER PRIMARY KEY AUTOINCREMENT, user_name VARCHAR(20), email VARCHAR(20), age INT(10))', [], (txn, results) => {
        console.log('Table created successfully');
      },
        (error) => {
          console.log('Eror occurred', error);
        }
      )

    })
  }
  const addUser = () => {
    if (!userName || !email || !age) {
      alert('Please enter user details');
      return false;
    }

    db.transaction((txn) => {
      txn.executeSql(
        'INSERT INTO tbl_users (user_name, email, age) VALUES (?, ?, ?)',
        [userName, email, age],
        (txn, results) => {
          // console.log(`${userName} inserted successfully`);
          setUserName('');
          setUserEmail('');
          setUserAge('');
        },
        (error) => {
          console.log('Error occurred', error);
        }
      );
    });
  };

  const getUsers = () => {
    db.transaction((txn) => {
      txn.executeSql('SELECT * FROM tbl_users', [], (txn, results) => {
        console.log('Results', results.rows);
        if (results.rows.length > 0) {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          setUsers(temp);
        }
      });
    });
  };

  useEffect(() => {
    createTable();
    getUsers();
  }, []);

  useEffect(() => {
    addUser();
    getUsers();

  }, []);

  const deleteUser = (id) => {
    db.transaction((txn) => {
      txn.executeSql('DELETE FROM tbl_users WHERE id = ?', [id], (txn, results) => {
        console.log('User deleted successfully');
        getUsers();
      });
    });
  };

  const handleEditUser = (id) => {
    db.transaction((txn) => {
      txn.executeSql('SELECT * FROM tbl_users WHERE id = ?', [id], (txn, results) => {
        const user = results.rows.item(0);
        setUserName(user.user_name);
        setUserEmail(user.email);
        setUserAge(user.age.toString());
        setSelectedUserId(id);
      });
    });
  };



  const updateUser = () => {
    if (!selectedUserId) {
      alert('Please select a user to edit');
      return;
    }

    db.transaction((txn) => {
      txn.executeSql(
        'UPDATE tbl_users SET user_name = ?, email = ?, age = ? WHERE id = ?',
        [userName, email, age, selectedUserId],
        (txn, results) => {
          console.log('User updated successfully');
          getUsers();
          setUserName('');
          setUserEmail('');
          setUserAge('');
          setSelectedUserId(null);
        }
      );
    });
  };


  const getUser = (id) => {
    db.transaction((txn) => {
      txn.executeSql('SELECT * FROM tbl_users WHERE id = ?', [id], (txn, results) => {
        console.log('User retrieved successfully');
        getUsers();
      });
    });
  }

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.nameHeader}>{item.user_name}</Text>
      <Text style={styles.emailHeader}>{item.email}</Text>
      <Text style={styles.ageHeader}>{item.age}</Text>
      <TouchableOpacity style={styles.allButtons}>
        <Icon
          name="edit"
          size={20}
          color="blue"
          style={styles.editButton}
          onPress={() => handleEditUser(item.id)}
        />
        <Icon
          name="trash-o"
          size={20}
          color="red"
          style={styles.actionIcon}
          onPress={() => deleteUser(item.id)}
        />
      </TouchableOpacity>
    </View>
  );


  return (
    <View>
      <StatusBar backgroundColor={'blue'} />
      <TextInput
        placeholder='Enter your username'
        value={userName}
        onChangeText={setUserName}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder='Enter your email'
        value={email}
        onChangeText={setUserEmail}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder='Enter your age'
        value={age}
        onChangeText={setUserAge}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <Button
        title={selectedUserId ? 'Update User' : 'Submit'}
        onPress={selectedUserId ? updateUser : addUser}
      />
      <Button title='Get Users' onPress={getUsers} />

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.nameHeader}>Name</Text>
          <Text style={styles.emailHeader}>Email</Text>
          <Text style={styles.ageHeader}>Age</Text>
          <Text style={styles.actionHeader}>Actions</Text>
        </View>
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    margin: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingVertical: 10,
    width: "100%"
  },
  columnHeader: {
    fontWeight: 'bold',
    flex: 1,

  },
  nameHeader: {
    fontWeight: 'bold',
    flex: 1,

    width: "25%"
  },
  emailHeader: {
    fontWeight: 'bold',
    flex: 1,

    width: "35%"
  },
  ageHeader: {
    fontWeight: 'bold',
    flex: 1,

    width: "15%"
  },
  actionHeader: {
    fontWeight: 'bold',
    flex: 1,

    width: "25%"
  },
  column: {
    flex: 1,

  },
  actionIcon: {
    color: 'black',
    fontWeight: 'bold',

    marginLeft: 12,
  },
  editButton: {
    color: 'blue',
    fontWeight: 'bold',

  },

  allButtons: {
    display: 'flex',
    flexDirection: "row",
    width: "25%",
  }


});

export default App;