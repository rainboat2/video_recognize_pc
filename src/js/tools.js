export const tools = {
    dataURLtoFile(dataUrl, filename) {
        // 把base64文件转化为二进制文件
        let arr = dataUrl.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    },
    format(fileSize){
        const oneKB = 1024;
        const oneMB = 1024 * oneKB;
        const oneGB = 1024 * oneMB;
        if (fileSize < oneKB)
            return fileSize + "B";
        else if (fileSize < oneMB)
            return (fileSize / oneKB).toFixed(1) + "KB";
        else if (fileSize < oneGB)
            return (fileSize / oneMB).toFixed(1) + "MB";
        else
            return (fileSize / oneGB).toFixed(1) + "GB";
    },
    isSameDay(d1, d2){
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getDate() === d2.getDate() &&
               d1.getMonth() === d2.getMonth();
    }
};
