# spotify-user-webscraper
Gather info about potionally all spotify users

(Our MongoDB database)[https://cloud.mongodb.com/freemonitoring/cluster/7X4WQA33PJN3A234F5WT5B5I53O6TU4I]

- [x] connect a MongoDB database
- [x] find and save all spotify users using link open.spotify.com/user/[sequence of characters here]
- [x] create script to gather all data from spotify users.
- [ ] create a docker container
- [ ] create a docker composer
- [ ] Analyse data
- [ ] share all the data

---

info
```
XPaths:
profile name = /html/body/div[3]/div/div[2]/div[3]/main/div[2]/div[2]/div/div/div[2]/section/div/div[1]/div[5]/span/h1
Followers = /html/body/div[3]/div/div[2]/div[3]/main/div[2]/div[2]/div/div/div[2]/section/div/div[1]/div[5]/div/span[1]/a
Following = /html/body/div[3]/div/div[2]/div[3]/main/div[2]/div[2]/div/div/div[2]/section/div/div[1]/div[5]/div/span[2]/a
````
Username is in the url.

- Old default usernames are 11 numbers;

   - notes: starts always with 1

- new default usernames are 25 characters e.g. : '01ztsti0lmi5yvw9i6u663ydk'
    - notes: starts always with 0

search of usernames:
    1. find all old default usernames;
