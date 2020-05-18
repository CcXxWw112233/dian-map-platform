export const setSession = async (key,data)=>{
    let session = window.sessionStorage;
    if(key){
        let type = typeof data;
        let obj = type === 'string' ? data : JSON.stringify(data);
        obj = typeof obj === 'number' ? obj.toString(): obj;
        session.setItem(key,obj);

        return Promise.resolve({code:0, message:'保存成功',data: obj});
    }

    return Promise.reject({code : -1, message:"缺少key"})
}

export const getSession = async (key) => {
    let session = window.sessionStorage;
    if(key){
        let data = session.getItem(key);
        try{
            let obj = typeof JSON.parse(data) === "number" ? data : JSON.parse(data);
            return Promise.resolve({code:0,message:"获取成功",data: obj})
        }catch(err){
            return Promise.resolve({code:0,message:"获取成功",data: data})
        }
    }

    return Promise.reject({code:-1,message:"缺少key"})
}