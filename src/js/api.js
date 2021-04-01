// const host = "http://172.22.84.47:8080";
const host = "http://localhost:8080";

export const api = {
    resPath: host + '/res',

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

    // 文件夹相关的请求链接
    getFilesAndDirectoriesUrl: host + "/directory/getFilesAndDirectories",
    addDirectoryUrl: host + "/directory/add",
    renameDirectoryUrl: host + "/directory/rename",
    deleteDirectoryUrl: host + "/directory/delete",
}
