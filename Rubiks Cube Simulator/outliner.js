// Handles the 2D Outliner

let o_faces;

const init_2d_outliner = () => {

    // 2D Outline Container
    const outliner = document.getElementById("TwoDOutliner");

    // Styling
    outliner.style.gridTemplateColumns = `repeat(3, auto)`;

    let up = document.createElement("canvas");
    let down = document.createElement("canvas");
    let left = document.createElement("canvas");
    let right = document.createElement("canvas");
    let front = document.createElement("canvas");
    let back = document.createElement("canvas");

    // Do not change the order
    o_faces = [front, right, left, up, down, back];

    let ctx, width, height, count = 0;

    for(let i of o_faces){
        i.classList.add("TwoD_outline");
        i.height = _config.outliner2D_size;
        i.width = _config.outliner2D_size;

        ctx = i.getContext("2d");
        [width, height] = [_config.outliner2D_size, _config.outliner2D_size];
        ctx.strokeStyle = "#333";
        ctx.fillStyle = faceColors[count];
        ctx.rect(0,0, width, height);
        ctx.fill();

        // For creating the 4 intersecting lines
        ctx.beginPath();
        ctx.moveTo(width/3, 0);
        ctx.lineTo(width/3, height);
        ctx.moveTo(width*2/3, 0);
        ctx.lineTo(width*2/3, height);
        ctx.moveTo(0, height/3);
        ctx.lineTo(width, height/3);
        ctx.moveTo(0, height*2/3);
        ctx.lineTo(width, height*2/3);
        ctx.stroke();

        count++;
    }

    up.style.gridColumnStart = 2;
    left.style.gridColumnStart = 1;
    left.style.gridRowStart = 2;
    front.style.gridColumnStart = 2;
    front.style.gridRowStart = 2;
    right.style.gridRowStart = 2;
    right.style.gridColumnStart = 3;
    down.style.gridColumnStart = 2;
    down.style.gridColumnEnd = 3;

    back.style.gridColumnStart = 2;
    back.style.gridRowStart = 4;

    up.dataset.pos = "back";
    down.dataset.pos = "down";
    front.dataset.pos = "front";
    back.dataset.pos = "up";
    left.dataset.pos = "left";
    right.dataset.pos = "right";

    up.dataset.posnum = "4";
    down.dataset.posnum = "5";
    front.dataset.posnum = "0";
    back.dataset.posnum = "3";
    left.dataset.posnum = "1";
    right.dataset.posnum = "2";

    outliner.append(...o_faces);
};

const rotator2D = (face, cw = false) => {
    let f, north, south, west, east, northNum, southNum, eastNum, westNum;

    north = _faceData.up;
    south = _faceData.down;
    switch(face){
        case "f":
            f = _faceData.front;
            west = _faceData.left;
            east = _faceData.right;

            northNum = getSouth();
            southNum = getNorth();
            eastNum = getWest();
            westNum = getEast();

            northFace = getSouth(north);
            southFace = getNorth(south);
            eastFace = getWest(east);
            westFace = getEast(west);
            break;
        case "b":
            f = _faceData.back;
            west = _faceData.right;
            east = _faceData.left;

            northNum = getNorth();
            southNum = getSouth();
            eastNum = getWest();
            westNum = getEast();

            northFace = getNorth(north);
            southFace = getSouth(south);
            eastFace = getWest(east);
            westFace = getEast(west);
            break;
        case "l":
            f = _faceData.left;
            west = _faceData.front;
            east = _faceData.back;
            cw = !cw;
        
            northNum = getWest();
            southNum = getWest();
            eastNum = getEast();
            westNum = getWest();

            northFace = getWest(north);
            southFace = getWest(south);
            eastFace = getEast(east);
            westFace = getWest(west);
            break;
        case "r":
            f = _faceData.right;
            west = _faceData.front;
            east = _faceData.back;

            northNum = getEast();
            southNum = getEast();
            eastNum = getWest();
            westNum = getEast();

            northFace = getEast(north);
            southFace = getEast(south);
            eastFace = getWest(east);
            westFace = getEast(west);
            break;
        case "u":
            f = _faceData.up;
            north = _faceData.back;
            south = _faceData.front;
            west = _faceData.left;
            east = _faceData.right;

            northNum = getNorth();
            southNum = getNorth();
            eastNum = getNorth();
            westNum = getNorth();

            northFace = getNorth(north);
            southFace = getNorth(south);
            eastFace = getNorth(east);
            westFace = getNorth(west);
            break;
        case "d":
            f = _faceData.down;
            north = _faceData.front;
            south = _faceData.back;
            west = _faceData.left;
            east = _faceData.right;

            northNum = getSouth();
            southNum = getSouth();
            eastNum = getSouth();
            westNum = getSouth();

            northFace = getSouth(north);
            southFace = getSouth(south);
            eastFace = getSouth(east);
            westFace = getSouth(west);
            break;
    }
    c_f = JSON.parse(JSON.stringify(f));


    // On Face - 2 Colors
    [f[1], f[5], f[7], f[3]] = shifter_sides([f[1], f[5], f[7], f[3]], cw);
    // On Face - 3 Colors
    [f[0], f[2], f[8], f[6]] = shifter_sides([f[0], f[2], f[8], f[6]], cw);
    if(face == "l"){
        cw = !cw;
    }
    console.log(f);
    // Side Faces
    [northFace, eastFace, southFace, westFace] = shifter_sides([northFace, eastFace, southFace, westFace], cw);
    
    [north[northNum[0]], north[northNum[1]], north[northNum[2]]] = [...northFace];
    [south[southNum[0]], south[southNum[1]], south[southNum[2]]] = [...southFace];
    [east[eastNum[0]], east[eastNum[1]], east[eastNum[2]]] = [...eastFace];
    [west[westNum[0]], west[westNum[1]], west[westNum[2]]] = [...westFace];

    render_outline();
};

const render_outline = () => {
    let ctx, width, height, boxH, boxW, startH, startW, count = 0;

    // Loop through the 6 faces (data of colors in each face)
    for(let i in _faceData){
        // console.log(count);
        // console.log(document.querySelector(`[data-posnum='${count}']`));
        let targetFace = document.querySelector(`[data-posnum='${count}']`);
        [width, height] = [targetFace.width, targetFace.height];
        boxH = height/3;
        boxW = width/3;

        ctx = targetFace.getContext("2d");
        ctx.strokeStyle = "#333";
        
        let countF = 0;
        // Loop through 9 colors in a face
        for(let j of _faceData[i]){
            
            switch(countF){
                case 0:
                    [startW, startH] = [0,0];
                    break;
                case 1:
                    [startW, startH] = [boxW,0];
                    break;
                case 2:
                    [startW, startH] = [boxW*2,0];
                    break;
                case 3:
                    [startW, startH] = [0,boxH];
                    break;
                case 4:
                    [startW, startH] = [boxW,boxH];
                    break;
                case 5:
                    [startW, startH] = [boxW*2,boxH];
                    break;
                case 6:
                    [startW, startH] = [0,boxH*2];
                    break;
                case 7:
                    [startW, startH] = [boxW,boxH*2];
                    break;
                case 8:
                    [startW, startH] = [boxW*2,boxH*2];
                    break;
            }

            ctx.beginPath();
            ctx.fillStyle = faceColors[j-1];
            ctx.rect(startW, startH, boxW, boxH);
            ctx.fill();
            ctx.closePath();

            countF++;
        }
            
        ctx.beginPath();
        ctx.moveTo(width/3, 0);
        ctx.lineTo(width/3, height);
        ctx.moveTo(width*2/3, 0);
        ctx.lineTo(width*2/3, height);
        ctx.moveTo(0, height/3);
        ctx.lineTo(width, height/3);
        ctx.moveTo(0, height*2/3);
        ctx.lineTo(width, height*2/3);
        ctx.stroke();

        count++;
    }
};

const getNorth = (arr) => {
    if(!arr){
        return [2,1,0];
    }
    return [arr[2], arr[1], arr[0]];
};

const getSouth = (arr) => {
    if(!arr){
        return [6,7,8];
    }
    return [arr[6], arr[7], arr[8]];
};

const getWest = (arr) => {
    if(!arr){
        return [0,3,6];
    }
    return [arr[0], arr[3], arr[6]];
};

const getEast = (arr) => {
    if(!arr){
        return [8,5,2];
    }
    return [arr[8], arr[5], arr[2]];
};