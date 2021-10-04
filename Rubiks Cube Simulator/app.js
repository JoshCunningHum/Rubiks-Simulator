// Runs after the document is full loaded
var scene, camera, renderer, cube, controls, spot, spot2, spot3, parentMesh;

var Cubes = [];

var _faces = {
    f : new THREE.Mesh(),   // Front
    b : new THREE.Mesh(),   // Back
    l : new THREE.Mesh(),   // Left
    r : new THREE.Mesh(),   // Right
    u : new THREE.Mesh(),   // Up
    d : new THREE.Mesh(),   // Down

    // Slices
    x : new THREE.Mesh(),
    y : new THREE.Mesh(),
    z : new THREE.Mesh()
};

var _config = {
    cube_distance : 1.01,
    outliner2D_size: 130
}

const faceColors = [
    // "white",
    // "crimson",
    // "turquoise",
    // "limegreen",
    // "#222",
    // "orangered"
];

var _faceData = {
    front: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    left: [2, 2, 2, 2, 2, 2, 2, 2, 2],
    right: [3, 3, 3, 3, 3, 3, 3, 3, 3],
    back: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    up: [5, 5, 5, 5, 5, 5, 5, 5, 5],
    down: [6, 6, 6, 6, 6, 6, 6, 6, 6]
}

var _isTurning = false;

document.addEventListener("DOMContentLoaded", (e) => {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // controls.minDistance = 0;
    // controls.maxDistance = Infinity;

    // controls.minPolarAngle = 0; // radians
    // controls.maxPolarAngle = Math.PI/2; // radians

    document.body.appendChild(renderer.domElement);

    for(let i = 0; i < 6; i++){
        faceColors.push("rgb(" + randomRGB() + ")");
    }
    _init();
    animate();

    init_2d_outliner();
    render_outline();
});

// Handles THREE JS initialization
const _init = () => {

    // test
    // cube = new Square(1, 1, 1);
    // cube.changeMat(new THREE.MeshToonMaterial({color: "crimson"}));
    // cube.add();
    // cube.move(10);
    // cube.wireframe();

    for(let k = 0; k < 3; k++){
        for(let j = 0; j < 3; j++){
            for(let i = 0; i < 3; i++){
                let cube = new Square();
                cube.changeMat(new THREE.MeshToonMaterial({color: 0x333333}));

                cube.move((i-1)*_config.cube_distance, (j-1)*_config.cube_distance, (k-1)*_config.cube_distance);
                cube.add();
                
                cube.x = (i-1);
                cube.y = (j-1);
                cube.z = (k-1);


                Cubes.push(cube);
            }
        }
    }

    // ambient light
    let amb = new Lights("ambient", 0xffffff, .25);
    amb.add();

    // spot light
    spot = new Lights("spot", 0x404040, 0.25);
    spot.position(2.5, 2.5, 2.5);
    spot.add();

    spot2 = new Lights("spot", 0x555555, 0.5);
    spot2.position(0, 2.5, 0.75);
    spot2.add();

    spot3 = new Lights("spot", 0x666666, 0.45);
    spot3.position(0, 0, -2.5);
    spot3.add();

    // Helpers

    // let spot3Helper = new THREE.SpotLightHelper(spot3.obj, "blue");
    // let spot2Helper = new THREE.SpotLightHelper(spot2.obj, "green");
    // let spotHelper = new THREE.SpotLightHelper(spot.obj, "yellow");
    // scene.add(spotHelper, spot2Helper, spot3Helper);

    camera.position.z = 7.5;

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", animate);

    // Adds the Parents in the scene
    for(let i in _faces){
        scene.add(_faces[i]);
    }
    lastRotation = Cubes[26].obj.rotation.z;

    addColorstoCube();
}

var planeHolders = [];

let _t_ = 0;
let FlatRadius, SphereRadius, _isPlaying, _isDoneRecording = false;

const animate = () => {
    // requestAnimationFrame( animate );

    if(_isPlaying){
        _t_ += 0.01;

        camera.position.x = SphereRadius * Math.cos(_t_);
        camera.position.z = SphereRadius * Math.sin(_t_/3);
        camera.position.y = SphereRadius * Math.sin(_t_/2);

        camera.lookAt(0,0,0);


    }else{
        if(!_isDoneRecording){
            FlatRadius = (camera.position.x**2) + (camera.position.z**2);
            SphereRadius = Math.sqrt( FlatRadius + (camera.position.y**2) );
        }
    }

    controls.update();
    renderer.render(scene, camera);

}

const f_front = (cw) => {
    let [face, axis] = 'fz';
    let squares = ref_state(face, true);

    _isTurning = true;
    rotator2D(face,cw);

    createjs.Tween.get(_faces[face].rotation).to({[axis] : _faces[face].rotation[axis] + radian( (cw) ? 90 : -90 )}, 500, createjs.Ease.getPowInOut(3)).call(fixPositions, [squares, face, cw, axis]);

    // 2D OUTLINER
};

const f_back = (cw) => {
    let [face, axis] = 'bz';
    let squares = ref_state(face, true);

    _isTurning = true;
    rotator2D(face,cw);

    createjs.Tween.get(_faces[face].rotation).to({[axis] : _faces[face].rotation[axis] + radian( (cw) ? -90 : 90 )}, 500, createjs.Ease.getPowInOut(3)).call(fixPositions, [squares, face, !cw, axis]);
};

const f_left = (cw) => {
    let [face, axis] = 'lx';
    let squares = ref_state(face, true);

    _isTurning = true;
    rotator2D(face,cw);

    createjs.Tween.get(_faces[face].rotation).to({[axis] : _faces[face].rotation[axis] + radian( (cw) ? 90 : -90 )}, 500, createjs.Ease.getPowInOut(3)).call(fixPositions, [squares, face, !cw, axis]);
};

const f_right = (cw) => {
    let [face, axis] = 'rx';
    let squares = ref_state(face, true);

    _isTurning = true;
    rotator2D(face,!cw);

    createjs.Tween.get(_faces[face].rotation).to({[axis] : _faces[face].rotation[axis] + radian( (cw) ? -90 : 90 )}, 500, createjs.Ease.getPowInOut(3)).call(fixPositions, [squares, face, cw, axis]);
};

const f_up = (cw) => {
    let [face, axis] = 'uy';
    let squares = ref_state(face, true);

    _isTurning = true;
    rotator2D(face,cw);

    createjs.Tween.get(_faces[face].rotation).to({[axis] : _faces[face].rotation[axis] + radian( (cw) ? 90 : -90 )}, 500, createjs.Ease.getPowInOut(3)).call(fixPositions, [squares, face, cw, axis]);
};

const f_down = (cw) => {
    let [face, axis] = 'dy';
    let squares = ref_state(face, true);

    _isTurning = true;
    rotator2D(face,cw);

    createjs.Tween.get(_faces[face].rotation).to({[axis] : _faces[face].rotation[axis] + radian( (cw) ? -90 : 90 )}, 500, createjs.Ease.getPowInOut(3)).call(fixPositions, [squares, face, !cw, axis]);
};

const s_x = (cw) => {
    let squares = ref_state(face, true);

};

const s_y = (cw) => {
    let squares = ref_state(face, true);

};

const s_z = (cw) => {
    let squares = ref_state(face, true);

};

const findCubes = ( axis, value , r_obj = false) => {
    let c = [];
    let c_obj = [];
    for(let i of Cubes){
        let pos = i[axis];
        if(pos == value){
            c.push(i);
            c_obj.push(i.obj);
        }
    }
    return (r_obj) ? c_obj : c;
}

const ref_state = (face, r_obj = false) => {
    let axis, value;

    // This method uses Parent Switching which produces a lot of errors
    // Applies Children on Parent Objects
    switch(face){
        case "f":
            _faces.f.add(...findCubes('z', 1, true));
            axis = 'z';
            value = 1;
            break;
        case "b":
            _faces.b.add(...findCubes('z', -1, true))
            axis = 'z';
            value = -1;
            break;
        case "l":
            _faces.l.add(...findCubes('x', -1, true));
            axis = 'x';
            value = -1;
            break;
        case "r":
            _faces.r.add(...findCubes('x', 1, true));
            axis = 'x';
            value = 1;
            break;
        case "u":
            _faces.u.add(...findCubes('y', 1, true));
            axis = 'y';
            value = 1;
            break;
        case "d":
            _faces.d.add(...findCubes('y',-1, true));
            axis = 'y';
            value = -1;
            break;
        case "x":
            _faces.x.add(...findCubes('x', 0, true));
            axis = 'x';
            value = 0;
            break;
        case "y":
            _faces.y.add(...findCubes('y', 0, true));
            axis = 'y';
            value = 0;
            break;
        case "z":
            _faces.z.add(...findCubes('z', 0, true));
            axis = 'z';
            value = 0;
            break;
    }

    if(r_obj){
        return findCubes(axis, value);
    }
};

const radian = (deg) => {
    return deg * Math.PI / 180;
};

const degree = (radian) => {
    return radian * 180 / Math.PI;  
};

const randomHex = () => {
    return (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
};

const randomRGB = () => {
    return [Math.round(Math.random()*255), Math.round(Math.random()*255), Math.round(Math.random()*255)];
};

document.onkeyup = function(e){
    if(_isTurning){
        return;
    }

    switch(e.which){
        case 70: // f
            f_front( (e.shiftKey) ? true : false );
            break;
        case 68: // d
            f_back( (e.shiftKey) ? true : false );
            break;
        case 82: //r
            f_right( (e.shiftKey) ? true : false );
            break;
        case 69: // nice e
            f_left( (e.shiftKey) ? true : false );
            break;
        case 86: // v
            f_up( (e.shiftKey) ? true : false );
            break;
        case 67: // c
            f_down( (e.shiftKey) ? true : false );
            break;
    }
}