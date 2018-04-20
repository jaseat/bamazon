const inquirer = require('inquirer');
const mysql = require('mysql');
const table = require('table');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bamazon'
});

let products;

function query() {
    let queryStr = `select item_id as id, product_name as name, price from products`;
    connection.query(queryStr, (err, results, fields) => {
        if(err)
            return console.log(err);
        let data = [['ID', 'Name', 'Price']];
        products = results;
        results.forEach(r => {
            data.push([r.id, r.name, r.price]);
        });
        let output = table.table(data);
        console.log(output);
        prompt();
    });
}

function prompt() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Choose an Item by ID',
            choices: products.map(v=>''+v.id),
            name: 'id'
        },
        {
            message: 'How much?',
            name: 'quantity',
            validate: input => isNaN(input) || !input ? 'Not a number' : true
        }
    ])
    .then(ans => {
        const {id, quantity} = ans;
        let queryStr = `select stock_quantity as stock, price from products where item_id = ${id};`;
        connection.query(queryStr, (err, results, fields) => {
            if(err)
                return console.log(err);
            const {stock, price} = results[0]
            if(stock < quantity)
                console.log('Insufficient quantity!');
            else{
                queryStr = `update products set stock_quantity = ${stock - quantity} where item_id = ${id}`;
                connection.query(queryStr, (err, results, fields) => {
                    if(err)
                        return console.log(err);
                    console.log('Transaction successful!');
                    console.log('Total Cost: ' + quantity * price);
                });
            }
            connection.end();
        });
    })
}

query();

