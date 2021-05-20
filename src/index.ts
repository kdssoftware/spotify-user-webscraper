import dotenv from "dotenv"
import {connect} from "./utils/db";
import puppeteer from 'puppeteer';

dotenv.config();
const start = async()=>{
  console.log("browser starting...");
  const browser = await puppeteer.launch({headless:true});
  console.log("browser started");
  console.log("database connecting...");
  const db = await connect();
  console.log("database connected");
  console.log("database getting collections...");
  const users = db.collection("users");
  const infoCollection = await db.collection("info");
  const info = await infoCollection.findOne({});
  let currentUsernameScraped = info.lastUsernameScraped;
  console.log("database received collections");
  while(true){
    try{
      const page = await browser.newPage();
      const found: {username:string|number,profilename:string,followers?:number,following?:number} = await searchNextUser(currentUsernameScraped,page);
      //found
      users.insertOne(found);
    }catch(e){
      //not found
      console.log("not found",e);
    }finally{
      //update database info
      infoCollection.updateOne({}, { $inc: { lastUsernameScraped: 1 } });
      currentUsernameScraped++;
    }
  }
};

const searchNextUser = (username:string|number, page:puppeteer.Page):Promise<any>=>{
  return new Promise(async(resolve,reject)=>{

    const timer = setTimeout(() => {
      reject(new Error(`Promise timed out after 5000 ms`));
  }, 5000);

    console.log("searching username "+username);
    await page.goto('https://open.spotify.com/user/'+username);
    //profile name
    try{
      await page.waitForXPath("/html/body/div[3]/div/div[2]/div[3]/main/div[2]/div[2]/div/div/div[2]/section/div/div[1]/div[5]/span/h1");
    }catch(e){
      reject("page didnt load in time");
    }
    clearTimeout(timer);
    let profilename;
    try{
      let profilenameHandle = await page.$x("/html/body/div[3]/div/div[2]/div[3]/main/div[2]/div[2]/div/div/div[2]/section/div/div[1]/div[5]/span/h1");
      profilename = await page.evaluate(el => el.textContent, profilenameHandle[0]);
      console.log("found username "+profilename);
    }catch(e){
      reject("no profile found");
    }
    
    //followers
    let followers = 0;
    try{
      let followersHandle = await page.$x("/html/body/div[3]/div/div[2]/div[3]/main/div[2]/div[2]/div/div/div[2]/section/div/div[1]/div[5]/div/span[1]/a");
      followers = Number((await page.evaluate(el => el.textContent, followersHandle[0])).split(' ')[0]);
    }catch(e){};

    //following
    let following = 0;
    try{
      let followingHandle = await page.$x("/html/body/div[3]/div/div[2]/div[3]/main/div[2]/div[2]/div/div/div[2]/section/div/div[1]/div[5]/div/span[2]/a");
      following = Number((await page.evaluate(el => el.textContent, followingHandle[0])).split(' ')[0]);
    }catch(e){};
    page.close();
    resolve({
      username,
      following,
      profilename,
      followers
    });
})}


start();
