const config = new JsonConfigFile("./plugins/AlexXuCN/CoordinatesBook.json",JSON.stringify({
    item: "owl:coordinates_book",
    maxPages: 5,
    maxEntriesPerPage: 10
}))

const initialPageList = new NbtList([
    new NbtCompound({
        "name": new NbtString("第 1 页"),
        "data": new NbtList([
            new NbtCompound({
                "name": new NbtString("awa"),
                "data": new NbtList([
                    new NbtInt(11),
                    new NbtInt(45),
                    new NbtInt(14)
                 ])
            })
        ])
    })
])

mc.listen("onUseItem",useBook);

function dimIdToDimName(dimid) {
    switch (dim) {
        case 0:
            return "主世界";
        case 1:
            return "下界";
        case 2:
            return "末地";
        default:
            return null;
    }
}

function useBook(pl,it) {
    let data = it.getNbt();
    if (data.getTag("cord_pages") === null) {
        data.setTag("cord_pages", initialPageList);
        pl.tell(pl.getHand().setNbt(data));
        data = pl.getHand().getNbt();
    }

    showBook(pl);
}

function unableToAddForm(pl,type) {
    switch (type) {
        case "page":
            pl.sendSimpleForm("无法增加页面",
                "已达上限: ", config.get("maxPages"),
                        ["确定"], [], () => {}
            );
            return;
        case "entry":
            pl.sendSimpleForm("无法增加条目",
                "已达上限: ", config.get("maxEntriesPerPage"),
                        ["确定"], [], () => {}
            );
            return;
    }
}

function showBook(pl) {
    let it = pl.getHand();
    let dataTag = it.getNbt().getData("cord_pages");
    let data = dataTag.toObject();
    let form = mc.newSimpleForm();
    form.setTitle(it.name).setContent("")
    for (let page in data) form.addButton(data[page].name);
    fm.addButton("添加页面").addButton("复制本书");
    pl.sendForm(form,(player,id)=>{
        handlePageSelection(player,id,it)
    });
}

function handlePageSelection(pl,id,it) {
    let data = it.getNbt();
    let pages = getTag("cord_pages");
    if (id === null) return;
    if (id === pages.getSize()-1) {
        if(data.setTag(pages.addTag(new NbtCompound({
            "name": new NbtString("第 " + id + " 页" ),
            "pages": new NbtList([])
        })))) { 
            it.setNbt(data) ;
            handlePageSelection(pl,id,it);
        } else pl.tell("未知错误");
        return;
    } else if (id === pages.getSize()) {
        pl.tell("copy the book")
        // copy the book
        return;
    }
    let form = mc.newSimpleForm();
    let page = pages.getTag(id);
    form.setTitle(page.getTag("name").get()).setContent("");
    for (let i = 0;i < page.getSize();i++) {
        form.addButton(page.getTag(i))
    }
    fm.addButton("添加条目").addButton("重命名页面：" + page.getTag("name").get()).addButton("删除页面");
    pl.sendForm(form,(player,_id)=>{
        handleEntrySelection(player,_id,id,it)
    });
}

function handleEntrySelection(pl,id,pageid,it) {
    let data = it.getNbt();
    let pages = getTag("cord_pages");
    let page = pages.getTag(pageid).getTag("data");
    if (id === null) return;
    switch (id) {
        case page.getSize() - 2:
            pl.tell("Add entry");
            //add entry
            return;
        case page.getSize() - 1:
            pl.tell("Rename Page");
            //rename page
            return;
        case page.getSize():
            pl.tell("delete page")
            //delete page
            return;
    }
    let form = mc.newSimpleForm();
    let entry = page.getTag(id);
    let entryData = entry.getTag("data")
    form.setTitle(entry.getTag("name")).setContent(`${entry.getTag("name")}\n${dimIdToDimName(entryData.getTag(0).get())} / ${entryData.getTag(1).get()} ${entryData.getTag(2).get()} ${entryData.getTag(3).get()}`);
    form.addButton("追踪").addButton("重命名").addButton("删除");
    pl.sendForm(form,(player,_id) => {
        switch (_id) {
            case 0:
                track(pl,
                    entry.getTag("name").get,
                    entryData.getTag(0).get(),
                    entryData.getTag(1).get(),
                    entryData.getTag(2).get(),
                    entryData.getTag(3).get()
                    )
                return;
            case 1:
                //rename
                pl.tell("rename entry")
                return;
            case 2:
                pl.tell("delete")
                //delete
                return;
        }
    })
}

async function track (pl,name,dim,x,y,z) {
    
}
