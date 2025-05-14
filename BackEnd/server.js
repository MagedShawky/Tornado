const express = require('express');
const mysql= require('mysql')
const cors= require('cors')


const app=express()
app.use(cors())
app.use(express.json())

const db= mysql.createConnection({
    host:"localhost",
    user:"root",
    password:'',
    database:'sem'
})

app.get('/', (rs,res)=>{
    return res.json("From BackEnd");
})

app.get('/users',(req,res) =>{
    const sql="select * from users";
    db.query(sql,(err,data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/all',(req,res) =>{
    const sql="select * from vehicle_records";
    db.query(sql,(err,data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.post('/addcar',(req,res)=>{
    try 
    {
        console.log('Start Entry')
        const sql="insert into vehicle_records(license_plate,owner_name,entry_time) VALUES (?,?,?)"
        const values=[
            req.body.license_plate,
            req.body.owner_name,
            req.body.entry_time
        ]
        //const lplate=req.body.license_plate
        //const owner =  req.body.owner_name
        //const entrytime= req.body.entry_time
        
        db.query(sql,values,(err,result)=>{
            if(err) return res.send({message: 'Somthing wrong ' + err})
            return res.send({success: 'Record Add Successfully'})
        })
        //res.send('POSTED')
    }
    catch(error)
    {
        console.error('Error fetching records:', error);
        res.send('Error:' + error)
    }
})

app.listen(8081,()=>{
    console.log("Listing 8081");
})