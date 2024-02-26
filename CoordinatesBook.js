// LiteLoader-AIDS automatic generated
/// <reference path="/home/alexxucn/.local/share/llse-aids/dts/helperlib/src/index.d.ts"/> 

ll.registerPlugin(
    "CoordinatesBook",
    "坐标记录本",
    [1,0,0,Version.Release],
    {
        author: "AlexXuCN",
        url: "http://github.com/OWLUnion/CoordinatesBook"
    }
);

ll.require(
  'NavigationAPI.lls.js',
  'https://www.lgc2333.top/llse/NavigationAPI.min.lls.js'
);

const navApi = {
    newTask: ll.import('NavAPI_newTask'),
    clearTask: ll.import('NavAPI_clearTask'),
    hasTask: ll.import('NavAPI_hasTask')
}

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
                    new NbtByte(0),
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
    switch (dimid) {
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
    if (!data.getKeys().includes("tag")) {
        pl.tell(Format.DarkPurple + "不可用: 需要任意附魔" + Format.Clear,5);
        return;
    } else if (!data.getTag("tag").getKeys().includes("cords")) {
        data.getTag("tag").setTag("cords", initialPageList);
        data.getTag("tag").removeTag("ench");
        pl.getHand().setNbt(data);
        pl.refreshItems();
        pl.tell(pl.getHand().getNbt().toString());
    }
    showBook(pl);
    return;
}

var unableToAddForm = {
    page: async pl => pl.sendSimpleForm("无法增加页面",
                "已达上限: ", config.get("maxPages"),
                        ["确定"], [], () => {}
            ),
    entry: async pl => pl.sendSimpleForm("无法增加条目",
                "已达上限: ", config.get("maxEntriesPerPage"),
                        ["确定"], [], () => {}
            )
}


function showBook(pl) {
    let it = pl.getHand();
    let data = it.getNbt().getTag("tag").getTag("cords").toArray();
    let form = mc.newSimpleForm();
    form.setTitle(it.name).setContent("");
    for (let page in data) form.addButton(data[page].name);
    form.addButton("添加页面")
        .addButton("复制本书");
    pl.sendForm(form,handlePageSelection);
    return;
}

function handlePageSelection(pl,id) {
    if (id === null) return;
    let data = pl.getHand().getNbt();
    let pages = data.getTag("tag").getTag("cords");
    if (id === pages.getSize()) {
        if (pages.getSize() === config.get("maxPages")) {
            unableToAddForm.page(pl);
            return;
        }
        data.getTag("tag").getTag("cords").addTag(new NbtCompound({
            "name": new NbtString("第 " + (id + 1) + " 页"),
            "pages": new NbtList([])
            }));
        pl.getHand().setNbt(data);
        pl.refreshItems();
    }
    if (id === pages.getSize()+1) {
        pl.tell("copy the book")
        // copy the book
        return;
    }
    let form = mc.newSimpleForm();
    let page = pages.getTag(id).toObject();
    form.setTitle(page.name).setContent("");
    for (let entry in page.data) {
        form.addButton(page.data[entry].name)
    }
    form.addButton("添加条目")
        .addButton("重命名页面：" + page.name)
        .addButton("删除页面");
    pl.sendForm(form, (player,_id) => handleEntrySelection(player,_id,id) );
}

function handleEntrySelection(pl,id,pageId) {
    if (id === null) return;
    let data = pl.getHand().getNbt();
    let pages = data.getTag("tag").getTag("cords");
    let page = pages.getTag(pageId).getTag("data");
    switch (id) {
        case page.getSize():
            // Add Entry
            if (page.getSize() === config.get("maxEntriesPerPage")) {
                unableToAddForm.entry(pl);
                return;
            }
            data.getTag("tag").getTag("cords").addTag(new NbtCompound({
                "name": new NbtString("第 " + id + " 页"),
                "pages": new NbtList([])
            }));
            pl.getHand().setNbt(data);
            pl.refreshItems();
            return;
        case page.getSize() + 1:
            pl.tell("Rename Page");
            //rename page
            return;
        case page.getSize() + 2:
            pl.tell("delete page")
            //delete page
            return;
    }
    let form = mc.newSimpleForm();
    let entry = page.getTag(id).toObject();
    form.setTitle(entry.name).setContent(`${entry.name}\n${dimIdToDimName(entry.data[0])} / ${entry.data[1]} ${entry.data[2]} ${entry.data[3]}`);
    form.addButton("追踪")
        .addButton("重命名")
        .addButton("删除");
    pl.sendForm(form,(player,_id) => {
        switch (_id) {
            case 0:
                track(player,
                    entry.getTag("name").get,
                    entryData.getTag(0).get(),
                    entryData.getTag(1).get(),
                    entryData.getTag(2).get(),
                    entryData.getTag(3).get()
                    )
                return;
            case 1:
                renameEntryForm(pl,pageId,_id);
                return;
            case 2:
                player.tell("delete")
                deleteEntryForm(pl,pageId,_id);
                return;
        }
    })
}

async function renameEntryForm(pl,pageId,entryId) {
    let form = mc.newCustomForm();
    let it = pl.getHand();
    let data = it.getNbt();
    let pages = data.getTag("tag").getTag("cords").toArray();
    form.setTitle(`重命名 ${it.name} > ${pages[pageId].name} > ${pages[pageId].data[entryId].name}`)
        .addInput("条目名称","",pages[pageId].data[entryId].name)
        .addButton("确定");
    pl.sendForm(form,(pl,data) => {
        if (data != null) renameEntry(pl,data[0],pageId,entryId);
    });
}

async function renameEntry(pl,name,pageId,entryId) {
    let data = pl.getHand().getNbt();
    data.getTag("tag").getTag("cords").getTag(pageId).getTag("data").getTag(entryId).setString("name",name);
    pl.getHand().setNbt(data);
    pl.refreshItems();
    handlePageSelection(pl,pageId);
}

async function renamePageForm(pl,pageId) {
    let form = mc.newCustomForm();
    let it = pl.getHand();
    let data = it.getNbt();
    let pages = data.getTag("tag").getTag("cords").toArray();
    form.setTitle(`重命名 ${it.name} > ${pages[pageId].name}`)
        .addInput("页面名称","",pages[pageId].name)
        .addButton("确定");
    pl.sendForm(form,(pl,data) => {
        if (data != null) renamePage(pl,data[0],pageId);
    });
}

async function renamePage(pl,name,pageId) {
    let data = pl.getHand().getNbt();
    data.getTag("tag").getTag("cords").getTag(pageId).setString("name",name);
    pl.getHand().setNbt(data);
    pl.refreshItems();
    showBook(pl);
}

async function deleteEntryForm(pl,pageId,entryId) {
    
}

async function track (pl,name,dim,x,y,z) {
    
}
