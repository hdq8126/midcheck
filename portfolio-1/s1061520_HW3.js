var interval = null;
var msg; 

window.addEventListener("load", init); //從這邊開始

function init()
{
	activation = new World(6,6); 
	activation.start();
	document.getElementById("btn_roll").addEventListener("click", roll); //roll點
}


function roll()
{
	document.getElementById("btn_roll").disabled = true; //  按鈕不能按

	var set = 100 ;
	var i =setInterval  (function() //動態骰子
	{
	
		var num = Math.floor( Math.random() * 6 + 1 );
		
		document.getElementById("pic_dice").src = "./images/die"+num+".png";
		set--;
		if (set==0)
		{
			console.log(num); // 把數字寫進流程控制台
			activation.players[ activation.turn%4 ].move(num); 
			clearInterval (i)
		}
	},10)
	
}



var World = function(x, y) // 6,6
{
	
	this.turn = 0; 
	this.map = []; // 他是一個陣列
	this.death = 0; // 破產人數
	this.players = []; // 他也是一個陣列
	
	this.string = "大富翁遊戲開始！";
	
	for (var i = 0; i < 20; i++)
		this.map.push({'owner':null, 'level':0});  //把圖的狀態改出來 擁有者:無 目前等級:0
	console.log(this.map);

	this.start = function()
	{
		for(var i = 0; i < 4; i++)
		{
			var player = new Player(i, 0, 10000, 
			{
					'money':document.getElementById('money'+(i+1)),
					 'status':document.getElementById('p'+(i+1)),
					  'dot':document.getElementById('dot'+(i+1))

					}, this);
			this.players.push(player);
			this.players[ 0 ].elem['status'].style.background = "#99FFFF"; //設定第一位玩家
		}
		this.update();
		return this;
	}
	this.update = function()
	{
		
		document.getElementById("pic_dice").src = "./images/blank.png";  // 用空白圖片把前一個骰子蓋掉
		// 錢錢
		for(var i = 0; i < 4; i++)
		{
			if( this.players[i].money != null && this.players[i].money < 0 ) //破產的判定
			{
				this.players[i].money = null; //破產
				this.string += (" 玩家 "+ (this.players[i].id+1)+" 破產了");
				this.death++;
			}

			if(this.players[i].money != null)
				this.players[i].elem.money.innerHTML = this.players[i].money;
			else
				document.getElementById("money"+(i+1)).innerHTML = "破產";
			
		}
		
		
		// map
		for(var i = 1; i < 20; i++)
		{
			var place = this.map[i];
			var owner = place.owner;
			var level = place.level;
			if( owner != null)
			{
				document.getElementById(i).style.background = (owner == 0) ? "#00BFFF" : (owner == 1) ? "LightGreen" : (owner == 2 ) ? "LightPink" : (owner == 3) ? "#FFFACD" : "white";
				//0是玩家1 ,1是2 ,2是3 ,3是4
				if (level==0)
				document.getElementById(i).innerHTML = "零";
				if (level==1)
				document.getElementById(i).innerHTML = "一";
				if (level==2)
				document.getElementById(i).innerHTML = "二";
				if (level==3)
				document.getElementById(i).innerHTML = "三";
				if (level==4)
				document.getElementById(i).innerHTML = "四";
				if (level==5)
				document.getElementById(i).innerHTML = "五";
			}
		}
		
		
		// announce
		
		this.log( this.string );
		this.string = "";
		
	}
	this.nextTurn = function()
	{ 
		this.update();
		
		for(var i = this.turn+1; i < this.turn + 5; i++)
			
		{
			if( this.players[ i % 4 ].money != null )  // 判斷現在是誰的回合
			{
				this.turn++;
				if( i == this.turn+4 || this.death == 3)   //結束 死了三個 
					this.end(i%4);
				break;
			} 
			else 
			{
				this.turn++;
			}
		}
		document.getElementById("btn_roll").disabled = false;
		
		for(var i = 0; i < 4; i++)
			this.players[ i ].elem['status'].style.background = "#D8A48F"; // 這個玩家之後把背景色換回白色
		
		if (this.turn%4 == 0)
			this.players[ 0 ].elem['status'].style.background = "#00BFFF";
		if (this.turn%4 == 1 )
			this.players[ 1 ].elem['status'].style.background = "#F0FFF0";
		if (this.turn%4 == 2 )
			this.players[ 2 ].elem['status'].style.background = "#FFCCCC";
		if (this.turn%4 == 3 )
			this.players[ 3 ].elem['status'].style.background = "#FFFFBB";

	}

	
	this.end = function(id) // 宣布某位玩家勝利
	{
		this.log("玩家 "+(id+1)+" 贏了 !");
		
		alert("玩家 "+(id+1)+" 贏了!");
	}
	
	this.log = function(text)
	{
		if(text == "") //沒有買土地沒有見房子也沒有踩到別人的地
		{			
		document.getElementById("msg").innerHTML = "沒發生什麼特別的事情" + "<br>" + document.getElementById("msg").innerHTML;
		return;
		} 
		document.getElementById("msg").innerHTML = text + "<br>" + document.getElementById("msg").innerHTML;
	}
	
	return this;
}


var Player = function(id, pos, money, elem, world)
{
	this.id = id;
	this.pos = pos;
	this.money = money;
	this.elem = elem;
	this.world = world;
	this.moveNum = 0;
	this.interval = null;

	this.move = function(value)
	{
		this.moveNum = value; 
		// 走幾步
		
		var self = this;
		
		var i = setInterval(function()
		{
			if( self.moveNum <= 0) 
			{
				var place = self.world.map[ self.pos ];
				if( place.owner != self.id && place.owner != null && self.pos != 0 && self.world.players[place.owner].money!=null)
				{
					// 踩到別人的地
					var sum = 500*( 1 + place.level);
					self.world.string += ( "玩家 "+(self.id+1) + " 玩家停在 " + (place.owner+1) + " 的地盤，稅金 " + sum + " 元" );
					self.money -= sum;
					self.world.players[ place.owner ].money += sum;
				}
				else
				{
					// 空地
					if( place.level < 5 && self.money >= 500 && place.owner == self.id)
					{
						if(confirm("要不要花費 500 加蓋房子？"))
						{
							self.world.string += ("玩家 "+(self.id+1) + " 花費 500 加蓋房子");
							self.money -= 500;
							place.level++;
						}
					}
					if( place.owner == null && self.money >= 1000 && self.pos != 0)  //self.pos != 0 不在起點上
					{
						if(confirm("要不要花費 1000 購買土地？"))
						{
							self.world.string += ("玩家 " + (self.id+1) + " 花費 1000 購買土地");
							self.money -= 1000;
							place.owner = self.id;
						}
					}
				}
				clearInterval(i);
				self.world.nextTurn();
			}
			else
			{
			if(interval == null) 
				self.moveAnimate();
			}
		}, 10);
	}

	
	
	this.moveAnimate = function() // 棋子移動的東西
	{
		var move = 1;
		var xy, direct;
		if( this.pos >= 0 && this.pos <= 4 ) //上面那排 往右走
		{
			xy = "left";
			direct = 105;
		}
		if( this.pos >= 5 && this.pos <= 9 ) //右邊那排 往下走
		{
			xy = "top";
			direct = 105;
		}
		if( this.pos >= 10 && this.pos <= 14 )//下面那排 往右走
		{
			xy = "left";
			direct = -105;
		}
		if( this.pos >= 15 && this.pos <= 19 )// 左邊那排 往上走
		{
			xy = "top";
			direct = -105;
		}
		
    	var self = this;  
		interval = setInterval(function()  //移動的動畫
		{
			if(move <= 0)
			{
			self.pos++;  // self 不能用 this 因為在裡面的會是下面的function
				if(self.pos >= 20) //路過原點的情況
				{
					self.pos %= 20;
					self.money += 2000;
					self.world.string += ("玩家 "+(self.id+1) + " 經過起點 獲得 2000 元")
				}
				self.moveNum--;
		    	clearInterval( interval );
		    	interval = null;
			}
			else
			{
			move--;
			self.elem['dot'].style[xy] = (parseInt( self.elem['dot'].style[xy] ) + direct) + "px";
			}
		}, 100);  


		
		
	}
	return this;
}
