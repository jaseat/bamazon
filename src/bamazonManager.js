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
        products = results;
    });
}

function view() {
    let queryStr = `select item_id as id, product_name as name, price, stock_quantity as quantity from products`;
    connection.query(queryStr, (err, results, fields) => {
        if(err)
            return console.log(err);
        let data = [['ID', 'Name', 'Price', 'Quantity']];
        products = results;
        results.forEach(r => {
            data.push([r.id, r.name, r.price, r.quantity]);
        });
        let output = table.table(data);
        console.log(output);
    });
    connection.end();
}

function low(){
    let queryStr = `select item_id as id, product_name as name, price, stock_quantity as quantity from products where stock_quantity < 5`;
    connection.query(queryStr, (err, results, fields) => {
        if(err)
            return console.log(err);
        let data = [['ID', 'Name', 'Price', 'Quantity']];
        products = results;
        results.forEach(r => {
            data.push([r.id, r.name, r.price, r.quantity]);
        });
        let output = table.table(data);
        console.log(output);
    });
    connection.end();
}

function addInventory(){
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
        let queryStr = `update products set stock_quantity = stock_quantity + ${quantity} where item_id = ${id}`;
        connection.query(queryStr, (err, results, fields) => {
            if(err)
                return console.log(err);
            console.log('Added ' + quantity + ' stock to ' + products[parseInt(id - 1)].name);
        });
        connection.end();        
    })
}

function addProduct(){
    inquirer.prompt([
        {
            message: 'Name of new product',
            name: 'name'
        },
        {
            message: 'Name of department',
            name: 'department'
        },
        {
            message: 'Price of new product',
            name: 'price',
            validate: input => isNaN(input) || !input ? 'Not a number' : true
        },
        {
            message: 'Stock of new product',
            name: 'stock',
            validate: input => isNaN(input) || !input ? 'Not a number' : true
        }
    ])
    .then(ans => {
        const {name, department, price, stock} = ans;
        let queryStr = `insert into products (product_name, department_name, price, stock_quantity) values (?, ?, ?, ?)`
        connection.query(queryStr, [name, department, price, stock], (err, results, field) => {
            if(err)
                return console.log(err);
            console.log('Added ' + name + ' to products');
        })
        connection.end();
    });
}

function prompt() {
    const options = [
        {
            name: 'View Products for Sale',
            value: 0
        },
        {
            name: 'View Low Inventory',
            value: 1
        },
        {
            name: 'Add to Inventory',
            value: 2
        },
        {
            name: 'Add New Product',
            value: 3
        }
    ];
    inquirer.prompt([
        {
            type: 'list',
            message: 'Choose an Option',
            choices: options,
            name: 'option'
        },
    ])
    .then(ans => {
        switch(ans.option){
            case 0:
                view();
                break;
            case 1:
                low();
                break;
            case 2:
                addInventory();
                break;
            case 3:
                addProduct();
                break;
        }
    })
}

query();
prompt();

