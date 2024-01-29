const config = new JsonConfigFile("./plugins/AlexXuCN/CoordinatesBook.json",JSON.stringify({
    item: "owl:coordinates_book",
    maxEntries: 50
}))

function showBook(pl,it) {
    let data = it.getNbt()
    data.getKeys().includes("Coordinates") || data.setTag("Coordinates")
    if (data.getTypeOf("Coordinates") != NBT.List) {
        pl.sendSimpleForm("数据损坏",
            "物品数据类型错误：" + data.getTypeOf("Coordinates") + "\n" + data.getTag("Coordinates").toString(2),
            ["确定"],[],()=>{}
        )
        return
    }
    
}

log(mc.getOnlinePlayers()[0].getHand().getNbt().getTag("Count").toString(4))