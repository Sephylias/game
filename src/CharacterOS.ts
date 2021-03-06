/// <reference path="./ObjInOpenSpace.ts"/>
/// <reference path="../tsDefinitions/astar.js" />


module Itsis{
	export enum State{
			home = 0,
			working =1,
			lunch = 2,
			breaktime = 3,
			goToDesk = 4,
			goToExit = 5
		};
	class LocationToGo{
		x : number;
		y : number;
		width : number;
		orientation : string;
	}

	export class CharacterOS{
		public static listOfCharacter : CharacterOS[] = [];
		public static charJSON = null;

		startingHour : number;
		endingHour : number;
		endurance : number;
		enduranceMax : number;
		productivity : number; // base 100
		motivation : number; // base 100
		state : number;
		speed : number ;
		sprite : Phaser.Sprite;
		locationToGo : LocationToGo;
		desk : ObjInOpenSpace = null;
		entree : ObjInOpenSpace = null;
		path : Object[] = null;
		name : String;

		constructor(name : String,game : Phaser.Game,group : Phaser.Group){
			// super();

			for (let ch of CharacterOS.charJSON.characters){
				if (ch.name == name){
					this.name = name;
					this.startingHour = ch.startinghour;
					this.endingHour = ch.endinghour;
					this.enduranceMax = ch.endurance;
					this.endurance = this.enduranceMax;
					this.productivity = ch.productivity;
					this.motivation = ch.motivation;

					this.entree = this.findObjInOS("entree");
					this.sprite = game.add.isoSprite(this.entree.sprite.isoX,this.entree.sprite.isoY, 0, name, 0, group);
					game.physics.isoArcade.enable(this.sprite);
					this.sprite.anchor.set(0.5);

					this.sprite.frame = 0;
					let itAnim=0;
					let tab=[ch.animationstep];
					for (let i = 0; i <ch.animationstep;i++){
						tab[i]=itAnim;
						itAnim+=1;
					}
					this.sprite.animations.add("down",tab,10,true);
					for (let i = 0; i <ch.animationstep;i++){
						tab[i]=itAnim;
						itAnim+=1;
					}
					this.sprite.animations.add("left",tab,10,true);
					for (let i = 0; i <ch.animationstep;i++){
						tab[i]=itAnim;
						itAnim+=1;
					}
					this.sprite.animations.add("right",tab,10,true);
					for (let i = 0; i <ch.animationstep;i++){
						tab[i]=itAnim;
						itAnim+=1;
					}
					this.sprite.animations.add("up",tab,10,true);

					this.sprite.visible=false;

				}
			}

			this.state = State.home;
			this.speed = 200;
			this.locationToGo = null;
			// console
			CharacterOS.listOfCharacter.push(this);
		}

		setSprite(sprite){
			this.sprite = sprite;
			this.sprite.anchor.set(0.5);

			this.sprite.frame = 0;

			this.sprite.animations.add("down",[0,1,2,3],10,true);
			this.sprite.animations.add("left",[4,5,6,7],10,true);
			this.sprite.animations.add("right",[8,9,10,11],10,true);
			this.sprite.animations.add("up",[12,13,14,15],10,true);

			this.sprite.visible=false;
		}

		findObjInOS(typeItem : String){
			let objToReturn = null;
			for (let objOs in ObjInOpenSpace.listOfObj ){
				if (ObjInOpenSpace.listOfObj[objOs].typeItem == typeItem){
					objToReturn = ObjInOpenSpace.listOfObj[objOs];
				}
			}
			return objToReturn;
		}


		moveOnPath(){

			if (this.path.length>0){
				let posx=this.path[0].x*38;
				let posy=this.path[0].y*38;
				// let width=this.locationToGo.width/2;
				let width = 16;
				let endX = 0;
				let endY = 0;

				if (posx < this.sprite.isoX+width){
					if ((posx-this.sprite.isoX-width)<-20) { // || (posx - this.sprite.isoX + width)>20){
						this.sprite.body.velocity.x = -this.speed;
						this.sprite.body.velocity.y = 0;
						if (this.sprite.animations.name!="left"){this.sprite.animations.play("left");}
					}else{
						endX = 1;
					}
				}else{
					if (posx-this.sprite.isoX+width>20){
						this.sprite.body.velocity.x = this.speed;
						this.sprite.body.velocity.y = 0;
						if (this.sprite.animations.name!="right"){this.sprite.animations.play("right");}
					}
					else{
					endX = 1;
					}
				}
				if (endX == 1){
					if (posy < this.sprite.isoY+width){
						if ((posy-this.sprite.isoY-width)<-20) { // || (posx - this.sprite.isoX + width)>20){
							this.sprite.body.velocity.y = -this.speed;
							this.sprite.body.velocity.x = 0;
							if (this.sprite.animations.name!="up"){this.sprite.animations.play("up");}
						}else{
							endY = 1;
						}
					}else{
						if (posy-this.sprite.isoY+width>20){
							this.sprite.body.velocity.y = this.speed;
							this.sprite.body.velocity.x = 0;
							if (this.sprite.animations.name!="down"){this.sprite.animations.play("down");}
						}
						else{
						endY = 1;
						}
					}

						if (endY == 1){
							this.path.shift();
							if (this.path.length == 0){
								this.sprite.body.velocity.x =0;
								this.sprite.body.velocity.y =0;
								switch (this.locationToGo.orientation){
									case "w":
										this.sprite.animations.play("right");
										break;
									case "e":
										this.sprite.animations.play("left");
										break;
									case "n":
										this.sprite.animations.play("down");
										break;
									case "s":
										this.sprite.animations.play("up");
										break;
								}
								this.sprite.animations.stop();
							}
						}

				}

			}
		}


		updateAtHome(timeInOpenSpace : number){
			// let entree = null;
			if (timeInOpenSpace > this.startingHour && timeInOpenSpace < this.endingHour){
				if (this.entree == null){
					this.entree = this.findObjInOS("entree");
				}
				if (this.entree != null){
					this.sprite.visible=true;
					this.sprite.x = this.entree.sprite.isoX;
					this.sprite.y = this.entree.sprite.isoY;
					// console.log(this.sprite);
					this.state=State.goToDesk;
				}
			}
		};

		createPath(ObjGoTo,openSpace){
			if (ObjGoTo!=null){
				if (this.locationToGo==null){
					this.locationToGo = new LocationToGo();
					this.locationToGo.x = ObjGoTo.sprite.isoX;
					this.locationToGo.y = ObjGoTo.sprite.isoY;
					this.locationToGo.width = ObjGoTo.sprite.width;
					this.locationToGo.orientation = ObjGoTo.orientation;

					}
				}

				if (this.path == null){
					graph = new Graph(openSpace);
					let isoX = Math.round(this.sprite.isoX / 38);
          let isoY = Math.round(this.sprite.isoY / 38);
          let destX = Math.round(this.locationToGo.x /38);
          let destY = Math.round(this.locationToGo.y / 38);
					let step  = 1+ Math.round(this.locationToGo.width/2)/38;
					switch (this.locationToGo.orientation){
						case "s":	destX+=1;
							break;
						case "w":
							destY+=1;
							break;
						case "n":destX-=1;
							break;
						case "e":destY-=1;
							break;
					}
					let start = graph.grid[isoX][isoY];
          let end = graph.grid[destX][destY];
          this.path = astar.search(graph,start,end);
				}

		}

		updateGoToDesk(openSpace){
			if (this.desk == null){
				this.desk = this.findObjInOS("desk");
			}

			if (this.desk!=null){
				this.createPath(this.desk,openSpace);
				if (this.path!=null){
					this.moveOnPath();
					if (this.path.length==0){
						this.state = State.working;
						this.path = null;
						this.locationToGo = null;
					}
				}
			}
		}
			//At end



		updateWorking(timeInOpenSpace : number){
			if(timeInOpenSpace>this.endingHour){
				this.state = State.goToExit;
				// this.sprite.visible=false;
			}
			// TODO : gestion des temps de pause

	// TODO : gestion du lunch time
		}

		updateGoToExit(openSpace){
			if (this.entree == null){
				this.entree = this.findObjInOS("entree");
			}
			if (this.entree!=null){
				this.createPath(this.entree,openSpace);
				if (this.path!=null){
					this.moveOnPath();
					if (this.path.length==0){
						this.state = State.home;
						this.path = null;
						this.locationToGo = null;
						this.sprite.visible=false;
					}
				}
			}
		}

		update(timeInOpenSpace,openSpace){
			switch(this.state){
				case State.home:
					this.updateAtHome(timeInOpenSpace);
				break;
				case State.goToDesk:
					this.updateGoToDesk(openSpace);
				break;
				case State.working:
					this.updateWorking(timeInOpenSpace);
				break;
				case State.goToExit:
					this.updateGoToExit(openSpace);
				break;
				default:
				break;
			}
		};

	}
}
