const parseBufferToList = (bufferObj) => {
    const bufferString = bufferObj.toString();
    const bufferList = bufferString.split("\n");
    return bufferList.filter((x) => x);
};

export { parseBufferToList };

