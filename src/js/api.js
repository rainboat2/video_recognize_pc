// const host = "http://172.22.84.47:8080";
const host = "http://localhost:8080";
// const host = "http://192.168.43.46:8080";

const resPath = host + '/res';

export const api = {
    resPath: resPath,

    // 获取说明文档
    specificationUrl: resPath + "/specification.txt",

    // 用户信息相关的请求链接
    loginUrl: host + '/user/login',
    logoutUrl: host + '/user/logout',
    registerUrl: host + '/user/register',
    currentUserUrl: host + '/user/getCurrentUser',
    changeAvatar: host + '/user/changeAvatar',
    updateUserInfoUrl: host + '/user/updateInfo',
    resetSecretKeyUrl: host + '/user/resetSecretKey',

    // token相关的请求链接
    getAllTokensUrl: host + '/token/getAll',
    addTokenUrl: host + '/token/addToken',

    // 文件相关的请求链接
    uploadVideoUrl: host + "/file/uploadVideo",
    renameFileUrl: host + "/file/rename",
    deleteFileUrl: host + "/file/delete",
    getFileByIdUrl: host + "/file/getById",

    // 文件夹相关的请求链接
    getFilesAndDirectoriesUrl: host + "/directory/getFilesAndDirectories",
    getDirectoriesUrl: host + "/directory/getDirectories",
    addDirectoryUrl: host + "/directory/add",
    renameDirectoryUrl: host + "/directory/rename",
    deleteDirectoryUrl: host + "/directory/delete",
    moveFileUrl: host + "/directory/moveFile",

    // 接口调用相关的请求
    onlineInvokeRecognizeUrl: host + "/invoke/recognize",
    getRecordsAndUserUrl: host + "/invoke/recordsAndUser",
}
