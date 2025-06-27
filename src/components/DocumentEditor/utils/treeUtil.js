
export const flattenTree = (list) => {
    let result = [];
    list.forEach(item => {
        result.push(item);
        if(item.children?.length > 0) {
            result = result.concat(flattenTree(item.children))
        }
    })
    return result;
}