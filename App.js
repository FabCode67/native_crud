import React, { useEffect, useState } from 'react';
import { StatusBar, View, TextInput, Button, FlatList, Text } from 'react-native';
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();
const App = () => {

  const [category, setCategory] = useState();
  const [categories, setCategories] = useState([]);  const createTable = () => {
    db.transaction((txn) => {
      txn.executeSql('CREATE TABLE IF NOT EXISTS tbl_category (id INTEGER PRIMARY KEY AUTOINCREMENT, category_name VARCHAR(20))', [], (txn, results) => {
        console.log('Table created successfully');
      },
      (error) => {
        console.log('Eror occurred', error);
      }
      )

    })
  }
  const addCategory = () => {
    if(!category) {
      alert('Please enter category');
      return false;
    }
    db.transaction((txn) => {
      txn.executeSql('INSERT INTO tbl_category (category_name) VALUES (?)', [category], (txn, results) => {
        console.log(`${category} inserted successfully`);
        setCategory('');
        // getCategories();
      },
      (error) => {
        console.log('Error occurred', error);
      }
      )
    })
  }

  const getCategories = () => {
    db.transaction((txn) => {
      txn.executeSql('SELECT * FROM tbl_category ORDER BY id DESC', [], (txn, results) => {
        console.log('Results', results.rows.length);
        let len = results.rows.length;

        if (len > 0) {
          let categories = [];
          for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);
            categories.push({ id: row.id, category_name: row.category_name });
          }
          setCategories(categories);
        }
      });
    });
  };
  
  const deleteCategory = (id) => {
    db.transaction((txn) => {
      txn.executeSql('DELETE FROM tbl_category WHERE id = ?', [id], (txn, results) => {
        console.log('Results', results.rowsAffected);
        if (results.rowsAffected > 0) {
          alert('Category deleted successfully');
        } else {
          alert('Category deletion failed');
        }
      });
    });
  
  }

  const updateCategory = (id) => {
    db.transaction((txn) => {
      txn.executeSql('UPDATE tbl_category SET category_name = ? WHERE id = ?', [category, id], (txn, results) => {
        console.log('Results', results.rowsAffected);
        if (results.rowsAffected > 0) {
          alert('Category updated successfully');
        } else {
          alert('Category updation failed');
        }
      });
    });
  }

  const searchCategory = (category) => {
    db.transaction((txn) => {
      txn.executeSql('SELECT * FROM tbl_category WHERE category_name LIKE ?', ['%' + category + '%'], (txn, results) => {
        console.log('Results', results.rows.length);
        let len = results.rows.length; // Fix: Change 'res' to 'results'
  
        if (len > 0) {
          let categories = [];
          for (let i = 0; i < len; i++) {
            let row = results.rows.item(i); // Fix: Change 'res' to 'results'
            categories.push({ id: row.id, category_name: row.category_name });
          }
          console.log('Categories', categories);
        }
      });
    });
  }
 
const getSingleCategory = (id) => {
  db.transaction((txn) => {
    txn.executeSql('SELECT * FROM tbl_category WHERE id = ?', [id], (txn, results) => {
      console.log('Results', results.rows.length);
      let len = results.rows.length; // Fix: Change 'res' to 'results'

      if (len > 0) {
        let categories = [];
        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i); // Fix: Change 'res' to 'results'
          categories.push({ id: row.id, category_name: row.category_name });
        }
        console.log('Categories', categories);
      }
    });
  });
}

useEffect(() => {
  createTable();
  getCategories();
}, []);
  
return (
  <View>
    <StatusBar backgroundColor={'blue'} />
    <TextInput
      placeholder='Enter your category'
      value={category}
      onChangeText={setCategory}
      style={{ borderWidth: 1, margin: 10, padding: 10 }}
    />

    <Button title='Submit' onPress={addCategory} />
    <Button title='Get Categories' onPress={getCategories} />

    <FlatList
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={{ marginVertical: 5 }}>
          <Text>{item.category_name}</Text>
        </View>
      )}
    />
  </View>
);
};

export default App;