
class ArrayUtil{
    static SORT_TYPE_ASC = 'asc';

    static SORT_TYPE_DESC = 'desc'

    isEmptyArray(arr) {
        return !this.isNotEmptyArray(arr)
    }

    isNotEmptyArray(arr) {
        return arr && arr.length > 0
    }
}

export default new ArrayUtil();