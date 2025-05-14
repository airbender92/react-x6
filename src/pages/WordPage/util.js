function convertImagesToBase64(html) {
    const imgElements = document.querySelectorAll('img');
    const imgPromises = Array.from(imgElements).map(img => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve({ originalSrc: img.src, base64Src: dataURL });
        };
        
        img.onerror = reject;
      });
    });
    
    return Promise.all(imgPromises).then(results => {
      let newHtml = html;
      results.forEach(result => {
        newHtml = newHtml.replace(result.originalSrc, result.base64Src);
      });
      return newHtml;
    });
  }