module.exports = {
  getRandomColor: function () {
    var colorRGB = [0xFF, 0x07, (Math.random() * 256) >> 0];
    colorRGB.sort(function () {
      return 0.5 - Math.random();
    });

    return {
      r: colorRGB[0],
      b: colorRGB[1],
      g: colorRGB[2]
    };
  },
  getRandomPosition: function (borderRight, borderLeft, borderBottom, borderTop) {
    return {
      x: Math.floor(Math.random() * (borderRight - borderLeft)) + borderLeft,
      y: Math.floor(Math.random() * (borderBottom - borderTop)) + borderTop
    }
  }
};
