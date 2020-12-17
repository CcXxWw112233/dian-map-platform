const compress = (file, maxWidth) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      let image = new Image();
      image.crossorigin = "anonymous";
      image.src = reader.result;
      image.onload = function () {
        const { width: originWidth, height: originHeight } = image;
        if (originWidth > maxWidth) {
          // 目标尺寸
          let targetWidth = originWidth;
          let targetHeight = originHeight;
          if (originWidth > maxWidth) {
            targetWidth = maxWidth;
            targetHeight = Math.round((originHeight * maxWidth) / originWidth);
          }
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          context.clearRect(0, 0, targetWidth, targetHeight);
          // 图片绘制，新设置一个图片宽高，达到压缩图片的目地
          context.drawImage(image, 0, 0, targetWidth, targetHeight);
          const dataUrl = canvas.toDataURL(file.type);
          var arr = dataUrl.split(",");
          var mime = arr[0].match(/:(.*?);/)[1];
          var bstr = atob(arr[1]);
          var n = bstr.length;
          var u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          //转换成file对象
          file = new File([u8arr], file.name, { type: mime });
          resolve(file);
        } else {
          resolve(true);
        }
      };
    };
  });
};

export { compress };
