import {NeuralNetwork} from './NeuralNetwork';

declare const ml5: any;
console.info('ml5 version:', ml5.version);
new NeuralNetwork("blabla", 2);
let isCapture: boolean = false;
const elementContainer = document.getElementById('capture');
const canvas = document.createElement('canvas');
const resize = function () {
	canvas.width = elementContainer.clientWidth;
	canvas.height = elementContainer.clientHeight;
};
resize();
const ctx = canvas.getContext('2d');
elementContainer.appendChild(canvas);

class Point {
	constructor(public x: number, public y: number) {
	}
}

class Segment {
	constructor(public x1: number, public y1: number, public x2: number, public y2: number) {
	}

	draw(offsetX = 0, offsetY = 0) {
		ctx.beginPath();
		ctx.moveTo(this.x1 - offsetX, this.y1 - offsetY);
		ctx.lineTo(this.x2 - offsetX, this.y2 - offsetY);
		ctx.stroke();
		ctx.closePath();
	}
}

class Path {
	constructor(public segments: Segment[] = []) {
	}
}

let capturedPoints: Point[] = [];
const path: Path = new Path();
const drawPath = () => {
	drawLines(path.segments);
};
const drawLines = (segs: Segment[]) => {
	let offsetX;
	let offsetY;
	segs.forEach((seg) => {
		offsetX = (typeof offsetX === 'undefined') ? seg.x1 : (offsetX > seg.x1) ? seg.x1 : offsetX;
		offsetX = (typeof offsetX === 'undefined') ? seg.x2 : (offsetX > seg.x2) ? seg.x2 : offsetX;
		offsetY = (typeof offsetY === 'undefined') ? seg.y1 : (offsetY > seg.y1) ? seg.y1 : offsetY;
		offsetY = (typeof offsetY === 'undefined') ? seg.y2 : (offsetY > seg.y2) ? seg.y2 : offsetY;
	});
	segs.forEach((l) => {
		l.draw();
		l.draw(offsetX, offsetY);
	})
};
window.addEventListener('mousedown', ($event) => {
	isCapture = true;
	capturedPoints = [];
});
window.addEventListener('mouseup', ($event) => {
	isCapture = false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	path.segments.push(...makePath(capturedPoints));
	drawPath();
});
elementContainer.addEventListener('mousemove', ($event) => {
	if (isCapture) {
		capturedPoints.push(new Point($event.x, $event.y));
	}
});
const makePath = (pts: Point[]): Segment[] => {
	const seg: Segment[] = [];
	const iterate = (startAt = 0) => {
		const end = endIndexAngleChange(pts, startAt, Math.PI / 4);
		const p1 = pts[startAt];
		const p2 = pts[end];
		if (p1 && p2) {
			seg.push(new Segment(p1.x, p1.y, p2.x, p2.y));
		}
		if (end < pts.length - 1) {
			iterate(end);
		}
	};
	iterate();
	return seg;
};
const endIndexAngleChange = (pts: Point[], startingIndex: number, maxAngle: number): number => {
	let cumulAngle = 0;
	let lastAngle;
	let lastPoint;
	let i;
	for (i = startingIndex; i < pts.length; i++) {
		if (lastPoint) {
			const newAngle = getAngle(lastPoint, pts[i]);
			if (lastAngle) {
				cumulAngle += (lastAngle - newAngle);
			}
			lastAngle = newAngle;
			if (Math.abs(cumulAngle) > maxAngle) {
				return i;
			}
		}
		lastPoint = pts[i];
	}
	return i - 1;
};
const getAngle = (p1: Point, p2: Point): number => {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};


