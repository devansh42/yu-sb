

create table users(email varchar(100),password varchar(100),uid int primary key autoincrement);

create table deployments(uid interger,hostname varchar(100),status tinyint,type varchar(20));
