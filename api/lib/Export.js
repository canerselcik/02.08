const xlsx = require("node-xlsx");


class Export {


    constructor() {

    }
    /**
     * 
     * @param {Array} titles Excel tablosunun başlıkları.                        ["ID","CATEGORY NAME", "IS ACTIVE"],
     * @param {Array} columns  Excel tablosuna yazılacak verilerin isimleri      [id, category_name, is _active]
     * @param {Array} data Excel tablosyna yazılacak veriler.
     */
    toExcel(titles, columns, data = []) {

        let rows = [];

        /*
        [
            ["ID","CATEGORY NAME", "IS ACTIVE"],
            ["asd", "name", "true"]
            bu şekilde bir veri 
        
        ]

        */

        rows.push(titles);

        for (let i = 0; i< data.length; i++) {
            let item = data [i];
            let cols = [];

            for(let j = 0; j < columns.length; j++) {
                    cols.push(item[columns[j]]);
            }

            rows.push(cols);

        }

        return xlsx.build([{name : "Sheet", data: rows}])

    }
}

module.exports = Export;