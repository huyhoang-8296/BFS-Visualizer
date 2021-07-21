import { render } from '@testing-library/react';
import React, {Component} from 'react';
import reactDom from 'react-dom';
import './BFS.css';

export default class BFS extends React.Component {
    constructor(props){
        super(props);

        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.state = {
            hexSize: 20,
            hexOrigin: {x: 400, y: 300}
        }
    }

    componentWillMount(){
        let hexParametres = this.getHexParametres();
        this.setState({
            canvasSize: {canvasWidth: 800, canvasHeight: 600},
            hexParametres: hexParametres
        })
    }

    componentDidMount(){
        const {canvasWidth,canvasHeight} = this.state.canvasSize;
        this.canvasHex.width = canvasWidth;
        this.canvasHex.height = canvasHeight;
        this.canvasCoordinates.width = canvasWidth;
        this.canvasCoordinates.height = canvasHeight;
        this.getCanvasPosition(this.canvasCoordinates);
        this.drawHexes();
    }

    // when we scroll over any hexagons, illuminate any hexagons that we scroll over without eliminating the hex that we already scrolled over

    shouldComponentUpdate(nextProps, nextState){
        if(nextState.currentHex !== this.state.currentHex){
            const {q, r, s, x, y} = nextState.currentHex;
            const {canvasWidth, canvasHeight} = this.state.canvasSize;
            const ctx = this.canvasCoordinates.getContext("2d");
            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear board as soon as we move to another hex.
            let currentDistanceLine = nextState.currentDistanceLine;
            for(let i = 0; i <= currentDistanceLine.length - 1; i++){
                this.drawHex(this.canvasCoordinates, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y), "lime", 2);
            }
            // this.drawNeighbor(this.Hex(q,r,s));
            this.drawHex(this.canvasCoordinates , this.Point(x,y), "lime", 2);
            return true;
        }
        return false;
    }

    getHexCornerCoord(center, i){
        let angle_deg = 60 * i + 30;
        let angle_rad = Math.PI / 180 * angle_deg;
        let x = center.x + this.state.hexSize * Math.cos(angle_rad);
        let y = center.y + this.state.hexSize * Math.sin(angle_rad);
        return this.Point(x,y);
    }

    Point(x,y){
        return {x:x, y:y};
    }

    drawHex(canvasID, center, color, width){
        for(let i = 0; i <= 5; i++){
            let start = this.getHexCornerCoord(center, i);
            let end = this.getHexCornerCoord(center, i + 1);

            this.drawLine(canvasID, {x: start.x, y: start.y}, {x: end.x, y: end.y}, color, width);
        }
    }

    drawLine(canvasID, start, end, color, width){
        const ctx = canvasID.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        // Add color and width 
        ctx.strokeStyle = color;
        ctx.lineWidth = width; 
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    }

    drawHexes(){
        const {canvasWidth, canvasHeight} = this.state.canvasSize;
        const {hexWidth, hexHeight, verDist, horizDist} = this.state.hexParametres;
        const hexOrigin = this.state.hexOrigin;
        let qLeftSide = Math.round(hexOrigin.x/hexWidth) * 4;
        let qRightSide = Math.round(canvasWidth - hexOrigin.x) / hexWidth * 2;
        let rTopSide = Math.round(hexOrigin.y/(hexHeight/2)); 
        let rBottomSide = Math.round((canvasHeight - hexOrigin.y)/(hexHeight/2));

        var p = 0;
        for (let r = 0; r <= rBottomSide; r++){
            if(r % 2 == 0 && r !== 0){
                p++;
            }
        }

        var p =0;
        for(let r = 0; r <= rBottomSide; r++){
            if(r%2 == 0 && r !== 0){
                p++;
            }
            for(let q = -qLeftSide; q <= qRightSide; q++){
                const {x, y} = this.hexToPixel(this.Hex(q-p, r));
                if((x > hexWidth/2 && x < canvasWidth - hexWidth/2) && (y > hexHeight/2 && y < canvasHeight - hexHeight/2)){
                    this.drawHex(this.canvasHex, this.Point(x,y), "grey");
                    //this.drawHexCoordinates(this.canvasHex, this.Point(x,y), this.Hex(q-p, r, -(q - p) - r));
                }
            }
        }

        var n = 0;
        for(let r = -1; r >= -rTopSide; r--){
            if(r%2 !== 0){
                n++;
            }
            for(let q = -qLeftSide; q <= qRightSide; q++){
                const {x, y} = this.hexToPixel(this.Hex(q+n, r));
                if((x > hexWidth/2 && x < canvasWidth - hexWidth/2) && (y > hexHeight/2 && y < canvasHeight - hexHeight/2)){
                    this.drawHex(this.canvasHex, this.Point(x,y), "grey");
                    //this.drawHexCoordinates(this.canvasHex, this.Point(x,y), this.Hex(q+n, r, -(q + n) - r));
                }
            }
        }
    }

    hexToPixel(h){
        let hexOrigin = this.state.hexOrigin;
        let x = this.state.hexSize * Math.sqrt(3) * (h.q  +  h.r/2) + hexOrigin.x;
        let y = this.state.hexSize * 3/2 * h.r + hexOrigin.y    ;
        return this.Point(x, y);
    }

    Hex(q,r,s){
        return {q: q, r: r, s: s};
    }

    drawHexCoordinates(canvasID, center, h){
        const ctx = canvasID.getContext("2d");
        ctx.fillText(h.q, center.x+6, center.y);
        ctx.fillText(h.r, center.x-3, center.y + 15);
        ctx.fillText(h.s, center.x-12, center.y)

    }

    getHexParametres(){
        let hexHeight = this.state.hexSize * 2;
        let hexWidth = Math.sqrt(3)/2 * hexHeight;
        let verDist = hexHeight * 3/4;
        let horizDist = hexWidth;
        return {hexWidth, hexHeight, verDist, horizDist}
    }

    handleMouseMove(e){
        const {left, right, top, bottom} = this.state.canvasPosition;
        const {canvasWidth, canvasHeight} = this.state.canvasSize;
        const {hexWidth, hexHeight,verDist, horizDist} = this.state.hexParametres;
        console.log(e.pageX, e.pageY);
        let offsetX = e.pageX - left;
        let offsetY = e.pageY - top;
        const {q,r,s} = this.cubeRound(this.pixeltoHex(this.Point(offsetX, offsetY))); // column, row and s value
        const {x,y} = this.hexToPixel(this.Hex(q,r,s));                                // x and y variables for color and width of the hex
        this.getDistanceLine(this.Hex(0,0,0), this.Hex(q,r,s));
        console.log(this.state.currentDistanceLine);
        if((x > hexWidth / 2 && x < canvasWidth - hexWidth /2) && (y > hexHeight / 2 && y < canvasHeight - hexHeight/2)){
            this.setState({
              currentHex: {q, r, s, x, y}
            })
        }
    }

    getCanvasPosition(canvasID){
        let rect = canvasID.getBoundingClientRect();
        this.setState({
            canvasPosition: {left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom}
        })
    }

    pixeltoHex(p){
        let size = this.state.hexSize;
        let origin = this.state.hexOrigin;
        let q = ((p.x - origin.x) * Math.sqrt(3)/3 - (p.y - origin.y)/3) / size;
        let r = (p.y - origin.y) * 2/3 / size;
        return this.Hex(q, r, -q, -r);
    }

    cubeRound(cube){
        var rx = Math.round(cube.q)
        var ry = Math.round(cube.r)
        var rz = Math.round(cube.s)

        var x_diff = Math.abs(rx - cube.q)
        var y_diff = Math.abs(ry - cube.r)
        var z_diff = Math.abs(rz - cube.s)

        if (x_diff > y_diff && x_diff > z_diff){
            rx = -ry-rz
        }
        else if(y_diff > z_diff){
            ry = -rx-rz
        }
        else{
            rz = -rx-ry
        }
        return this.Hex(rx, ry, rz)
    }

    cubeDirections(direction){
        const cubeDirections = [this.Hex(1,0,-1), this.Hex(1,-1,0), this.Hex(0, -1, 1), this.Hex(-1,0,1), this.Hex(-1,1,0), this.Hex(0,1,-1)];
        return cubeDirections[direction];
    }

    cubeAdd(a,b){
        return this.Hex(a.q + b.q, a.r + b.r, a.s + b.s);
    }

    // Subtract the hexagons
    cubeSubtract(hexA, hexB){
        return this.Hex(hexA.q - hexB.q, hexA.r - hexB.r, hexA.s - hexB.s);
    }

    getCubeNeighbor(h, direction){
        return this.cubeAdd(h, this.cubeDirections(direction));
    }

    drawNeighbor(h){
        for(let i = 0; i <= 5; i++){
            const {q, r, s} = this.getCubeNeighbor(this.Hex(h.q, h.r, h.s), i);
            const {x, y} = this.hexToPixel(this.Hex(q, r, s));
            this.drawHex(this.canvasCoordinates, this.Point(x,y), "red", 2);    
        }
    }

    // Calculate the distance between 2 hexes
    cubeDistance(hexA, hexB){
        const {q, r, s} = this.cubeSubtract(hexA, hexB);
        return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
    }

    linearInt(a, b, t){
        return (a + (b - a) * t)
    }

    cubeLinearInt(hexA, hexB, t){
        return this.Hex(this.linearInt(hexA.q, hexB.q, t),this.linearInt(hexA.r, hexB.r, t), this.linearInt(hexA.s, hexB.s, t));
    }

    // function get distance line, find each coordinates of each intermediate hexagons, store them in an array and draw them in the canvas

    getDistanceLine(hexA, hexB){
        let dist = this.cubeDistance(hexA, hexB);
        var arr = [];
        for(let i = 0; i <= dist; i++){
            let center = this.hexToPixel(this.cubeRound(this.cubeLinearInt(hexA, hexB, 1.0 / dist * i)));
            arr = [].concat(arr, center);
        }
        this.setState({
            currentDistanceLine: arr
        });
    }

    render() {
        return (
         <div className="BFS">
            <canvas ref={canvasHex => this.canvasHex = canvasHex}></canvas>
            <canvas ref ={canvasCoordinates => this.canvasCoordinates = canvasCoordinates} onMouseMove = {this.handleMouseMove}></canvas> 
         </div>
        )
    }
}