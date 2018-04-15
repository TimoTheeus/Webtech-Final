group id: 49
students: Timo van Milligen - 5710553, Fabian Machielsen - 
http://webtech.science.uu.nl/group49 <-- Not working, couldn't get it to not crash on the server

Website description:
A web store for clothing where u can create a user, login, edit/view your profile and history, 
browse products,sort them, add them to your cart and check out.

Application structure:
+-- node_modules
+-- static
|   +-- css
|        +-- style.css
|   +-- images
|        +-- products
|             +-- accessories
|                  +-- backpacks
|                  	+-- bagadidas.jpg
|                  	+-- bagadidas2.jpg
|                  	+-- bagcalvin.jpg
|                  	+-- baglevis.jpg
|                  	+-- bagtommy.jpg
|                  +-- hats
|                  	+-- beanilevis.jpg
|                  	+-- capadidas.jpg
|                  	+-- capcalvin.jpg
|                  	+-- caplevis.jpg
|                  	+-- captommy.jpg
|                  	+-- captommy2.jpg
|             +-- men
|             	+-- hoodies
|             		+-- hoodieadidas.jpg
|             		+-- hoodieyourturn.jpg
|             	+-- jackets
|             		+-- jacketmango.jpg
|             		+-- jacketpierone.jpg
|             		+-- jacketyourturn.jpg
|             	+-- jeans
|             		+-- jeansgstar.jpg
|             		+-- jeansgstar2.jpg
|             		+-- jeanspierone.jpg
|             	+-- shirts
|             		+-- shirtadidas.jpg
|             		+-- shirtlevis.jpg
|             		+-- shirttommty.jpg
|             		+-- shirttommyjeansslim.jpg
|             	+-- sweaters
|             		+-- slimsweatercasualfriday.jpg
|             		+-- slimsweatertommyjeans.jpg
|             		+-- sweatermango.jpg
|             	+-- swimwear
|             		+-- swimcalvin.jpg
|             		+-- swimpierone.jpg
|             		+-- swimtommy.jpg
|             	+-- underwear
|             		+-- uwearbjorn.jpg
|             		+-- uwearcalvin.jpg
|             +-- women
|             	+-- hoodies
|             		+-- hoodieginatricot.jpg
|             		+-- hoodielevis.jpg
|             		+-- hoodieslevis2.jpg
|             	+-- jackets
|             		+-- jacketgina.jpg
|             		+-- jacketgstar.jpg
|             	+-- jeans
|             		+-- jeansgina.jpg
|             		+-- jeanslevisslim.jpg
|             		+-- jeansmangoslim.jpg
|             	+-- shirts
|             		+-- shirtadidas.jpg
|             		+-- shirtgstar.jpg
|             	+-- sweaters
|             		+-- sweateradidas.jpg
|             		+-- sweatermango.jpg
|             	+-- swimwear
|             		+-- swimwearadidas.jpg
|             		+-- swimwearcalvin.jpg
|             		+-- swimwearcalvin2.jpg
|             		+-- swimweartommy.jpg
|             	+-- underwear
|             		+-- bracalvin.jpg
|             		+-- bratommy.jpg
|             		+-- thongcalvin.jpg
|             		+-- thongtommy.jpg
|        +-- cart.png
|        +-- homepage.png
|        +-- home.png
|        +-- profile.png
|   +-- scripts
|   	+-- cart.js
|   	+-- header.js
|   	+-- history.js
|   	+-- login.js
|   	+-- product.js
|   	+-- profile.js
|   	+-- register.js
|   	+-- selector.js
+-- views
|   +-- includes
|   	+-- foot.pug
|   	+-- head.pug
|   	+-- header.pug
|   +-- cart.pug
|   +-- history.pug
|   +-- home.pug
|   +-- login.pug
|   +-- prodbrowser.pug
|   +-- product.pug
|   +-- profile.pug
|   +-- register.pug
+-- _layouts
|   +-- default.html
|   +-- post.html
+-- data.db
+-- db.js
+-- defandfill.txt
+-- main.js
+-- package.json
+-- package-lock.json

database structure:
 ER DIAGRAM: https://drive.google.com/file/d/1qzKp6Kp8yvPZowv_Qeni1nH3wUbRp6Fx/view?usp=sharing

Logins and passwords:
login: admin password:admin
login: john2 password:password123

SQL Definition of database (without filling it):

CREATE TABLE Users(
   id integer,
   login varchar(25) not null,
   password char(64) not null,
   first_name varchar(50),
   last_name varchar(50),
   email varchar(50),
   PRIMARY KEY (id)
);

CREATE TABLE Products(
   id integer,
   title varchar(100) not null,
   brand varchar(30),
   price real,
   image varchar(50),
   description varchar(200),
   PRIMARY KEY (id)
);

CREATE TABLE Purchases(
   id integer,
   userid integer,
   prodid integer,
   PRIMARY KEY (id),
   FOREIGN KEY (userid) REFERENCES Users(id),
   FOREIGN KEY (prodid) REFERENCES Products(id)
);

CREATE TABLE Categories(
   id integer,
   category varchar(50),
   PRIMARY KEY (id)
);

CREATE TABLE ProdToCat (
   id integer,
   prodid integer,
   catid integer,
   PRIMARY KEY (id),
   FOREIGN KEY (prodid) REFERENCES Products(id),
   FOREIGN KEY (catid) REFERENCES Categories(id)
);


