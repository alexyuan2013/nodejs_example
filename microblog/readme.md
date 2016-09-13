# 《Node.js开发指南》示例代码

由于书中用的是Express 3的版本，一些npm安装命令和项目初始化操作与Express 4有一些区别，
这里采用的是Express 4的版本，因此可能与原书存在一定的差异。

## 快速开始

### 安装Express

> 如果一个包是某个工程的依赖，那么我们需要工程的目录下使用本地模式安装这个包，
如果要通过命令行调用这个包中的命令，则需要使用全局模式安装。

- Express 3

安装书中的安装方法，使用全局模式安装，即npm命令：
`$ npm install -g express`

- Express 4

首先创建一个项目文件夹，再运行：

`$ npm init`

初始化项目，生成package.json文件；
而Express 4不再以全局的模式安装，使用本地模式：

`$ npm install express --save `

其中，`--save`参数用来将包的依赖保存到package.json文件中，
下次直接运行`npm install`就会自动安装package.json文件中的依赖包。

虽然上面已经安装了Express，但是如果想使用命令行的方式，使用自带模板来创建项目就还需要安装`express-generator`：

`$ npm install -g express-generator`

### 建立工程

使用自带的ejs模板来创建工程：

`$ express -t ejs microblog`

然后进入项目目录，运行：

 `$ npm install`

它自动安装了以来ejs和express，因为package.json文件中已经做好了配置。

### 启动服务器

- Express 3： `$ node app.js`

- Express 4: `$ npm start`

### 工程的结构

- app.js

app.js是工程的入口







