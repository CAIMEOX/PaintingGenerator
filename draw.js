const getPixels = require("get-pixels");
const WebSocket = require("ws");
let block = "wool";
let colors = [[168, 168, 168], // 白色
[143, 59, 0], // 橙色
[152, 0, 67], // 品红色
[0, 153, 153], // 亮蓝色
[150, 150, 0], // 黄色
[59, 143, 0], // 绿色
[167, 83, 125], // 粉色
[64, 64, 64], // 灰色
[101, 101, 101], // 亮灰
[0, 83, 83], // 蓝绿色
[43, 12, 75], // 紫色
[0, 38, 77], // 蓝色
[52, 25, 0], // 棕色
[10, 76, 10], // 仙人掌绿
[127, 9, 9], // 红色
[17, 17, 17], // 黑色
];
let ms = 50;
let x1 = 10;
let y1 = 10;
let z1 = 10;
function sleep() {
    var now = new Date();
    var exitTime = now.getTime() + ms;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime) return;
    }
}
//颜色对比，返回ID
function get_color(r, g, b) {
    List = [];
    for (var a = 0; a < colors.length; a++) {
        r1 = r - colors[a][0];
        g1 = g - colors[a][1];
        b1 = b - colors[a][2];
        List.push(Math.sqrt((r1 * r1) + (g1 * g1) + (b1 * b1)));
    }
    //console.log(List.indexOf(Math.min.apply(null, List)));
    return List.indexOf(Math.min.apply(null, List));
}
//创建Websocket服务器
const events = new Array("AgentCommand", "AgentCreated", "PlayerMessage");
const wss = new WebSocket.Server({
    port: 8080
});
console.log("Please connect to 127.0.0.1:8080");
wss.on('connection',
function connection(ws) {
    for (var c = 0; c < events.length; c++) {
        ws.send(JSON.stringify({
            "body": {
                "eventName": events[c]
            },
            "header": {
                "requestId": "0ffae098-00ff-ffff-abbbbbbbbbdf3344",
                "messagePurpose": "subscribe",
                "version": 1,
                "messageType": "commandRequest"
            }
        }));
    }
    function command(cmd) {
        ws.send(JSON.stringify({
            "body": {
                "origin": {
                    "type": "player"
                },
                "commandLine": cmd,
                "version": 1
            },
            "header": {
                "requestId": "add538f2-94c1-422b-8334-41fa5e8778c9",
                "messagePurpose": "commandRequest",
                "version": 1,
                "messageType": "commandRequest"
            }
        }));
    }
    command("say §l§bPainting Generator connected.");
    command("say §l§bMade by CAIMEO");
    function paint(path) {
        getPixels(path,
        //获取像素信息
        function(err, pixels) {
        if(err){
        command("say §l§eError:" + err);
        return;
        }else{
            var carr = pixels.data;
            }
            var allData = [];
            var cData = [];
            for (var i = 0; i < carr.length; i++) {
                cData.push(carr[i]);
                if (i != 0 && (i + 1) % 4 == 0) {
                    allData.push(cData);
                    cData = [];
                }
            }
            //分割为二维数组
            IDList = [];
            for (var i = 0; i < allData.length; i++) {
                IDList.push(get_color(allData[i][0], allData[i][1], allData[i][2]));
            }
            command("say §l§eCalculate completed.");
            command("say §l§eImage information:");
            var width = pixels.shape[0];
            var height = pixels.shape[1];
            command("say §l§ewidth: " + width);
            command("say §l§eheight: " + height);
            command("say §l§eStart generating");
            command("say §l§eLeast generating time:" + (width * height * ms / 1000) / 60 + " min.");
            var count = 0;
            for (var x = 0; x < width; x++) {
                for (var z = 0; z < height; z++) {
                    //command("tp @s " + (x + x1) * 1 + " " + y1 + " " + (z + z1) * 1);
                    command("setblock " + (x + x1) * 1 + " " + y1 + " " + (z + z1) * 1 + " " + block + " " + IDList[count]);
                    console.log("setblock " + (x + x1) * 1 + " " + y1 + " " + (z + z1) * 1 + " " + block + " " + IDList[count]);
                    count++;
                    sleep();
                }
            }
            command("say §l§ePainting genterated");
        });
    }

    //draw <path:String>
    ws.on("message",
    function incoming(message) {
        if (JSON.parse(message).body.eventName == "PlayerMessage") {
            var player_message = JSON.parse(message).body.properties.Message;
            if (player_message.substring(0, 4) == "draw") {
                command("say §l§ebegin to calculate...");
                paint(player_message.substring(4, player_message.length).trim());
            }
            if (player_message.substring(0, 3) == "pos") {
                var val = player_message.substring(3, player_message.length).trim().split(" ");
                x1 = val[0] * 1;
                y1 = val[1] * 1;
                z1 = val[2] * 1;
                command("say §l§eX:" + x1 + "\nY:" + y1 + "\nZ:" + z1);
            }
            if (player_message.substring(0, 2) == "ms") {
                ms = player_message.substring(2, player_message.length).trim().split(" ");
                command("say §l§eDelay set: " + ms);
            }
            if (player_message.substring(0, 5) == "block") {
                block = player_message.substring(5, player_message.length).trim().split(" ");
                command("say §l§eBlock set: " + block);
            }
            if (player_message.substring(0, 3) == "pal") {
                var val0 = player_message.substring(3, player_message.length).trim().split(" ");
                switch (val0[0]) {
                case "opt":
                    colors = [[178, 178, 178], // White
                    [187, 102, 44], // Orange
                    [152, 61, 161], // Magenta
                    [84, 111, 170], // Light blue
                    [156, 145, 23], // Yellow
                    [47, 151, 38], // Green
                    [174, 105, 124], // Pink
                    [53, 53, 53], // Gray
                    [127, 133, 133], // Light grey
                    [32, 94, 120], // Cyan
                    [103, 43, 156], // Purple
                    [31, 41, 123], // Blue
                    [68, 41, 22], // Brown
                    [44, 61, 19], // Cactus green
                    [131, 36, 32], // Red
                    [21, 18, 18], // Black
                    ];
                    break;
                case "normal":
                    colors = [[254, 254, 254], // White - fixed so white gets picked over pink for white pixels
                    [255, 100, 0], // Orange
                    [200, 0, 200], // Magenta
                    [87, 132, 223], // Light blue
                    [255, 255, 0], // Yellow
                    [0, 255, 0], // Green
                    [255, 180, 200], // Pink
                    [72, 72, 72], // Gray
                    [173, 173, 173], // Light grey
                    [0, 100, 160], // Cyan
                    [120, 0, 200], // Purple
                    [0, 0, 175], // Blue
                    [100, 60, 0], // Brown
                    [48, 80, 0], // Cactus green
                    [255, 0, 0], // Red
                    [0, 0, 0], // Black
                    ];
                    break;
                case "opthd":
                    colors = [[168, 168, 168], // 白色
                    [143, 59, 0], // 橙色
                    [152, 0, 67], // 品红色
                    [0, 153, 153], // 亮蓝色
                    [150, 150, 0], // 黄色
                    [59, 143, 0], // 绿色
                    [167, 83, 125], // 粉色
                    [64, 64, 64], // 灰色
                    [101, 101, 101], // 亮灰
                    [0, 83, 83], // 蓝绿色
                    [43, 12, 75], // 紫色
                    [0, 38, 77], // 蓝色
                    [52, 25, 0], // 棕色
                    [10, 76, 10], // 仙人掌绿
                    [127, 9, 9], // 红色
                    [17, 17, 17], // 黑色
                    ];
                    break;
                default:
                    command("say §l§eMethod not found");
                    break;
                }
            }
        }
    });
});