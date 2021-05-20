import dotenv from "dotenv"
import {connect} from "./utils/db";
import puppeteer from 'puppeteer';

dotenv.config();
const start = async()=>{
  //configuration
  console.log("browser starting...");
  const browser = await puppeteer.launch({headless:true});
  console.log("browser started");
  console.log("database connecting...");
  const db = await connect();
  console.log("database connected");
  console.log("database getting collections...");
  const users = db.collection("users");
  const infoCollection = await db.collection("info");
  const badUsers = db.collection("badUsers");
  const info = await infoCollection.findOne({});
  let currentUsernameScraped = info.lastUsernameScraped;
  console.log("database received collections");

  //looping to find usernames
  while(true){
    try{
      const page = await browser.newPage();
      const found = await searchNextUser(currentUsernameScraped,page);
      //found
      console.log("found username "+found.username);
      const oldUser = await users.findOne({username:found.username});
      if(oldUser){
        users.replaceOne(oldUser,found);
      }else{
        users.insertOne(found);
      }
    }catch(e){
      //not found
      const newBadUser = {
        lastUpdated:Date.now(),
        username:currentUsernameScraped
      };
      const oldBadUser = await badUsers.findOne({username:currentUsernameScraped});
      if(oldBadUser){
        badUsers.replaceOne(oldBadUser, newBadUser);
      }else{
        badUsers.insertOne(newBadUser);
      }
    }finally{
      //update database info
      infoCollection.replaceOne({}, { lastUsernameScraped: increaseUsername(currentUsernameScraped) , lastUpdated:Date.now()});
      currentUsernameScraped = increaseUsername(currentUsernameScraped);
    }
  }
};

//search given username
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
      username:String(username),
      following,
      profilename,
      followers,
      lastUpdated:Date.now(),
      link:"https://open.spotify.com/user/"+username
    });
})}


const increaseUsername = (username:string) =>{
  const chars:string[] = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','%','_','-','&','*',')','(','=',',','^','@','~',':','>','<','|',']','[','+','$','!'];
  /**
   * 0 -> = -> 00 -> == -> 000 -> === -> .......
   */
  //example test123 => ['t', 'e', 's','t', '1', '!','!']
  /**10,11,12,...18,19,20 */
  username = String(username); 603
  let usr : string[] = username.split('');
  try{
    let countOfEndChars = usr.filter(x=>x===chars[chars.length-1]);
    //  !!!!
    // 00000
    if(countOfEndChars.length==usr.length){
      usr = usr.map(x=>chars[0]);
      usr.push(chars[0]);
      throw "break";
    }
    // 123!!
    // 12500
    // 12501
    let reverseUsr = usr.reverse();
    reverseUsr.forEach((char,index) => {
      if(char===chars[chars.length-1]){ // c == !
        reverseUsr[index] = chars[0];
      }else{
        reverseUsr[index] = chars[chars.indexOf(char)+1];
        reverseUsr.reverse();
        throw "break";
      }
    });

  }catch(e){}
  return usr.join("");
}

start();
