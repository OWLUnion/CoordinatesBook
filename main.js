const config = new JsonConfigFile("./plugins/AlexXuCN/CoordinatesBook.json",JSON.stringify({
    item: "owl:coordinates_book",
    maxEntries: 50
}))

function showBook(pl,it) {
    let data = it.getNbt()
    data.getKeys().includes("cord_pages") || data.setTag("cord_pages")
    if (data.getTypeOf("cord_pages") != NBT.List) {
        wrongType(pl,data.getTag("cord_pages"))
        return
    }

}

function wrongType(pl,nbt) {
    pl.sendSimpleForm("数据损坏",
            "错误的数据类型：" + nbt.getType() + "\n" + nbt.toString(2),
            ["确定"],[],()=>{}
        )
    return
}

log(mc.getOnlinePlayers()[0].getHand().getNbt().getTag("Count").toString(4))