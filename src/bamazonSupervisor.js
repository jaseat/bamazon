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
            name: 'View Products Sales by Department',
            value: 0
        },
        {
            name: 'Create New Department',
            value: 1
        },
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
                addDepartment();
                break;
        }
    })
}

query();
prompt();