module Itsis {

    export class Jeu extends Phaser.State {

        floorGroup: Phaser.Group;
        cubeGroup: Phaser.Group;
        decorGroup: Phaser.Group;
        characterGroup: Phaser.Group;
        cursorPos: Phaser.Plugin.Isometric.Point3;
        actualDate : number;
        text : Phaser.Text;
        lastTicksHour : number;
        levelJSON;
        sceneryJSON;
        charJSON;
        mapOpenSpace : number[][];


        preload(){

          // Add and enable the plug-in.
          var isoPlugin = new Phaser.Plugin.Isometric(this.game);
          this.game.plugins.add(isoPlugin);
          this.game.iso.anchor.setTo(0.5, 0.2);
          this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

          // Load assets & level jsons
          this.levelJSON = this.game.cache.getJSON('level');
          this.charJSON = this.game.cache.getJSON('characters');
          this.sceneryJSON =  this.game.cache.getJSON('scenery');
          // Load level images
            // Load floor
          this.game.load.image('floor', 'assets/scenery/' + this.levelJSON.openSpace.floor);

            // Load items
              // Retrieve image and image type
          for (let obj of this.levelJSON.openSpace.objInOpenSpace){
              let idObj = obj.id;
              for (let scen in this.sceneryJSON){
                  if (scen.toString() == idObj){
                      let sceneryInfo = this.sceneryJSON[scen][0];
                      let urlObj = 'assets/scenery/' + sceneryInfo.url;
                      // Load image according to image typpe
                      if (sceneryInfo.spritetype == "spritesheet"){
                        // Case Spritesheet
                          this.game.load.spritesheet(idObj, urlObj, sceneryInfo.width, sceneryInfo.height);
                      }else{
                        // Case single image
                          this.game.load.image(idObj, urlObj);
                      }
                  }
              }
          }
            // Load characters
          for (let ch of  this.charJSON.characters){
              this.load.spritesheet(ch.name, ch.sprite,ch.sizex,ch.sizey,ch.nbanim);
          }
          CharacterOS.charJSON = this.charJSON;


        }

        create() {
            // <debug>
            var style = { font: "32px Arial", fill: "#ff0044", wordWrap: false,  align: "center" };
            this.text = this.game.add.text(0,0,"hello",style);
            // </debug>

            // Global level settings
            this.lastTicksHour = this.game.time.time;
            this.actualDate=7.00;

            // Create groups for assets
            this.floorGroup = this.game.add.group();
            this.decorGroup = this.game.add.group();
            this.characterGroup = this.game.add.group();

            // Floor building
            this.spawnTilesFloor(this.levelJSON.openSpace.sizex, this.levelJSON.openSpace.sizey);

            // Sprite in openspace
              // Creation
            for (let obj of this.levelJSON.openSpace.objInOpenSpace){
                let idObj = obj.id;
                for (let scen in this.sceneryJSON){
                    if (scen.toString() == idObj){
                        let newObj = new ObjInOpenSpace();
                        let objScenery = this.sceneryJSON[scen][0];
                        newObj.typeItem = objScenery.type;
                        newObj.id = idObj;
                        newObj.locationX = obj.posx*38;
                        newObj.locationY = obj.posy*38;
                        newObj.spriteType = objScenery.spritetype;
                        newObj.orientation = objScenery.orientation;
                        if (newObj.spriteType == "spritesheet"){
                            newObj.frame = objScenery.frame;
                        }else{
                            newObj.frame = 0;
                        }
                    }
                }
            }

              // Drawin
            for (let objToOpenspace of ObjInOpenSpace.listOfObj){
              if (objToOpenspace.typeItem == "entree"){
                objToOpenspace.sprite = this.game.add.isoSprite(objToOpenspace.locationX, objToOpenspace.locationY, 0, objToOpenspace.id, objToOpenspace.frame, this.floorGroup);
                objToOpenspace.sprite.anchor.set(0.5, 0.2);
              }else{
                objToOpenspace.sprite = this.game.add.isoSprite(objToOpenspace.locationX, objToOpenspace.locationY, 0, objToOpenspace.id, objToOpenspace.frame, this.decorGroup);
                objToOpenspace.sprite.anchor.set(0.5);
              }
            }

            let tempChar = new CharacterOS("malepirate",this.game,this.characterGroup);

            this.mapOpenSpace =[this.levelJSON.openSpace.sizex];
            for (let x=0; x < this.levelJSON.openSpace.sizex;x++){
              this.mapOpenSpace[x] = [this.levelJSON.openSpace.sizey];
            }

            for (let x=0; x < this.levelJSON.openSpace.sizex;x++){
              for (let y = 0; y< this.levelJSON.openSpace.sizey;y++){
                this.mapOpenSpace[x][y]=1;
              }
            }

            // Construction de la map de l'openspace servant plus tard dans les astar (pathfinding) des CharacterOS
            // centralisé ici pour l'instant
            for (let it of ObjInOpenSpace.listOfObj){
              let isoX = it.sprite.isoX / 38;
              let isoY = it.sprite.isoY / 38;
              if (it.typeItem !="entree"){
                if (it.sprite.width>38){
                  switch (it.orientation){
                    case "w":
                      this.mapOpenSpace[isoX-1][isoY] = 0;
                    break;
                    case "e":
                    this.mapOpenSpace[isoX+1][isoY] = 0;
                  break;
                  case "s":
                    this.mapOpenSpace[isoX][isoY-1] = 0;
                  break;
                  case "n":
                    this.mapOpenSpace[isoX][isoY+1] = 0;
                  break;
                  }
                }
                this.mapOpenSpace[isoX][isoY] = 0;
              }
            }


          // console.log(this.mapOpenSpace);
        }

        spawnTilesFloor(sizeX: number, sizeY: number) {
            sizeX *= 38;
            sizeY *= 38
            var tileFloor;
            for (let xx = 0; xx < sizeX; xx += 38) {
                for (let yy = 0; yy < sizeY; yy += 38) {
                   tileFloor = this.game.add.isoSprite(xx, yy, 0, 'floor', 0, this.floorGroup);
                   tileFloor.anchor.set(0.5, 0);
                }
            }
        }

        formatHour(){
          if ((this.game.time.time - this.lastTicksHour) >= 1000 ){
            this.lastTicksHour = this.game.time.time;
            this.actualDate+=0.10;
            var tempHour = Math.floor(this.actualDate);
            var tempMin = Math.round((this.actualDate-tempHour) * 100);
            if (tempMin>=60){
              this.actualDate=tempHour+1;
              if (this.actualDate>=24){
                this.actualDate-=24;
              }
            }
            tempHour = Math.round(this.actualDate);
            tempMin = Math.round((this.actualDate-tempHour) * 100);
            this.text.setText(((tempHour>=10?tempHour:"0" + tempHour) + ":" + (tempMin>=10?tempMin:"0"+tempMin)));
          }
        }

        startMainMenu(){
            this.game.state.start("MainMenu", true, false);
        }

        render(){
          this.formatHour();
          for (let itChar of CharacterOS.listOfCharacter){
            itChar.update(this.actualDate,this.mapOpenSpace);
          }
        }

    }

}
