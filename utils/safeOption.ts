import express from 'express';

let tryWrap = async (res: express.Response, func: () => Promise<any>) => {
    try {
        await func();
    } catch (_) {
        return res.status(400).json({
            result: false,
            reason: "Thiếu dữ liệu."
        });
    }
}

export { tryWrap }