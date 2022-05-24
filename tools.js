class Square{
    constructor(x = 1, y = 1, z = 1, mat = new THREE.MeshBasicMaterial({color: 'crimson'})){
        this.x = x;
        this.y = y;
        this.z = z;

        this.geom = new THREE.BoxGeometry(x, y, z);
        this.mat = mat;
        this.obj = new THREE.Mesh(this.geom, this.mat);
    }
    add(){
        scene.add(this.obj);
        return;
    }
    remove(){
        scene.getObjectName(this.obj.name);
        return;
    }
    move(x = 0, y = 0, z = 0){
        this.obj.position.x += x;
        this.obj.position.y += y;
        this.obj.position.z += z;
    }
    rotate(x = 0, y = 0, z = 0){
        this.obj.rotation.x += x;
        this.obj.rotation.y += y;
        this.obj.rotation.z += z;
    }
    changeMat(mat){
        this.obj.material = mat;
    }
    wireframe(){
        if(this.obj.material.wireframe){
            this.obj.material.wireframe = false;
        }else{
            this.obj.material.wireframe = true;
        }
    }
}

class Lights{
    constructor(type, color = 0xffffff, intensity = 1.0){
        this.type = type;
        this.color = color;

        switch(type){
            case "spot":
                this.obj = new THREE.SpotLight(color, intensity)
                break;
            case "ambient":
                this.obj = new THREE.AmbientLight(color, intensity);
                break;
            case "direction":
                this.obj = new THREE.DirectionalLight(color, intensity);
                break;
            case "hemisphere":
                this.obj = new THREE.HemisphereLight(color, intensity);
                break;
        }
        
    }
    add(){
        scene.add(this.obj);
    }
    position(x, y, z){
        x *= 5;
        y *= 5;
        z *= 5;
        this.obj.position.set(x, y, z);
    }
    target(obj){
        this.obj.target = obj;
    }
}

const rotator = (squares, face, cw) => {
    let theX = 'x', theY = 'y', x_inv = 1, y_inv = 1, base_rotation = "z", base_invert = 1;

    switch(face){
        
        case "f":
            // base_invert = -1;
        case "b":

            break;
        case "l":
        case "x":
            base_invert = -1;
            base_rotation = "x"
            theX = 'z';
            break;
        case "r":
            theX = 'z';
            base_rotation = "x"
            base_invert = -1;
            break;
        case "u":
            theX = 'z';
            theY = 'x';
            base_rotation = "y"
            break;
        case "y":
        case "d":
            base_rotation = "y"
            theX = 'z';
            theY = 'x';
            // x_inv = -1;
            break;
    }

    for(let i of squares){
        if(i[theX] == 0 || i[theY] == 0){
            // For rotating Single and Double Color Cubes
            if(i[theX] != i[theY]){
                if(i[theX] == 0){
                    [i[theX], i[theY]] = [x_inv * (cw) ? i[theY] * -1: i[theY], 0];
                }else{
                    [i[theX], i[theY]] = [0 , y_inv *  (!cw) ? i[theX] * -1: i[theX]];
                }
            }else{
                continue;
            }

        }else{
            // For rotating Triple Color Cubes
            if(i[theX] == i[theY]){
                (cw) ? i[theX] *= x_inv *  -1 : i[theY] *= y_inv *  -1;
            }else{
                (cw) ? i[theY] *= y_inv *  -1 : i[theX] *= x_inv * -1
            }
        }

        // i.obj.children[0].rotation[base_rotation] += radian( (cw) ? 90 : -90);
        rotateAroundWorldAxis(i.obj, base_rotation, radian(((cw) ? 90 : -90)*base_invert) );

        // Animation Debug
        // createjs.Tween.get(i.obj.rotation).to({[base_rotation]: i.obj.rotation[base_rotation] + radian( ((cw) ? 90 : -90)*base_invert )}, 500);


        // console.log(base_rotation);
    }

}

const fixPositions = ( squares, face, cw, axis) => {
    rotator(squares, face, cw);
    mover(Cubes);
    _faces[face].rotation[axis] = 0;

    _isTurning = false;
    // console.log(face, axis);
};

const mover = (squares, face, cw) => {
    for(let i of squares){
        i.obj.position.x = i.x * _config.cube_distance;
        i.obj.position.y = i.y * _config.cube_distance;
        i.obj.position.z = i.z * _config.cube_distance;
    }
};

const convertRGBFloat = (c) => {
    return [255 * c.r, 255 * c.g, 255 * c.b];
};

const addColorstoCube = () => {
    let geom = new THREE.PlaneGeometry( 1,1 ), mat;

    // Front Face
    for(let i of findCubes('z', 1, true)){
        let color = new THREE.Color(faceColors[0]);
        mat = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );

        let plane = new THREE.Mesh(geom, mat);
        i.add(plane);
        plane.position.z = 0.5001;
        planeHolders.push(plane);
    }

    // Left Face
    for(let i of findCubes('x', -1, true)){
        let color = new THREE.Color(faceColors[1]);
        mat = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );

        let plane = new THREE.Mesh(geom, mat);
        i.add(plane);
        plane.position.x -= 0.5001;
        plane.rotation.y += radian(90);
        planeHolders.push(plane);
    }

    // Right Face
    for(let i of findCubes('x', 1, true)){
        let color = new THREE.Color(faceColors[2]);
        mat = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );

        let plane = new THREE.Mesh(geom, mat);
        i.add(plane);
        plane.position.x += 0.5001;
        plane.rotation.y += radian(90);
        planeHolders.push(plane);
    }

    // Top Face
    for(let i of findCubes('y', 1, true)){
        let color = new THREE.Color(faceColors[4]);
        mat = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );

        let plane = new THREE.Mesh(geom, mat);
        i.add(plane);
        plane.position.y += 0.5001;
        plane.rotation.x += radian(90);
        planeHolders.push(plane);
    }

    // Bottom Face (Default)

    for(let i of findCubes('y', -1, true)){
        let color = new THREE.Color(faceColors[5]);
        mat = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );

        let plane = new THREE.Mesh(geom, mat);
        i.add(plane);
        plane.position.y -= 0.5001;
        plane.rotation.x += radian(90);
        planeHolders.push(plane);
    }

    // Back Face
    for(let i of findCubes('z', -1, true)){
        let col = new THREE.Color(faceColors[3]);
        mat = new THREE.MeshBasicMaterial( {color: col, side: THREE.DoubleSide} );

        let plane = new THREE.Mesh(geom, mat);
        i.add(plane);
        plane.position.z -= 0.5001;
        planeHolders.push(plane);
    }
};

// Code I got on Stack Overflow
// Basically rotates an object in the World Matrix instead of rotating in its own axis
// Modified the line 3 ,4 & 7 for "letter axis" instead of the object axis

var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space
function rotateAroundWorldAxis(object, axis, radians) {
    let r_axis = new THREE.Vector3(0, 0, 0);

    switch(axis){
        case "x":
            r_axis.x = 1;
            break;
        case "y":
            r_axis.y = 1;
            break;
        case "z":
            r_axis.z = 1;
    }

    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(r_axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

const shuffle = (n = 0) => {
    for(let i = 0; i < n; i++){
        let moveType = Math.round(Math.random() * 100 * 2) % 12;

        setTimeout( (moveType)=>{
            switch(moveType){
                case 0:
                    f_front();
                    break;
                case 1:
                    f_back();
                    break;
                case 2:
                    f_right();
                    break;
                case 3:
                    f_left();
                    break;
                case 4:
                    f_up();
                    break;
                case 5:
                    f_down();
                    break;
                case 6:
                    f_front(true);
                    break;
                case 7:
                    f_back(true);
                    break;
                case 8:
                    f_right(true);
                    break;
                case 9:
                    f_left(true);
                    break;
                case 10:
                    f_up(true);
                    break;
                case 11:
                    f_down(true);
                    break;
            }
        },(i+1)*550,moveType);
       
        console.log(moveType);
    }

};

const play = () => {
    _isPlaying = true;
};

const stop = () => {
    _isPlaying = false;
}

const turner2D = (face) => {
    switch(face){
        case "f":

    }
};

const shifter_sides = (arr, cw) => {
    let lastElement, initial_length = arr.length;
    if(cw){
        lastElement = arr[0];
        for(let i = 0; i < initial_length; i++){
            if(i == arr.length - 1) break;
            arr[i] = arr[i+1];
        }
        arr[arr.length - 1] = lastElement;
    }else{ 
        lastElement = arr[arr.length - 1];
        for(let i = 0; i < initial_length; i++){
            if(i == arr.length - 1) break;
            arr[arr.length-(i+1)] = arr[arr.length - (i+2)];
        }
        arr[0] = lastElement;
    }
    return arr;
};
