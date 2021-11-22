const fetch = require('node-fetch');
var express = require('express')
var bodyParser = require('body-parser')
var request = require('request-promise')
var app = express()
let PORT = process.env.PORT || 3001;
// app.set('port', (process.env.PORT || 3001))

app.use('/', express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))




app.get('/webhook', function (req, res) {

  res.send('linebot');
})


app.post('/webhook', async (req, res) => {
  const events = await req.body.events;
  for (const event of events) {
    if (event.type === "message") {
      msg = event.message.text

      console.log(event);

      if (msg == "ผู้ติดเชื้อรายวัน") {
        obj_replaytoken_day[event.source.userId] = event.replyToken
        covid_day()
      }
      else if (msg == "กราฟผู้ติดเชื้อ 1 สัปดาห์") {
        obj_replaytoken_ripple[event.source.userId] = event.replyToken
        covid19_ripple3_now()
      }
      else if (msg == "ผู้ติดเชื้อรายวันแยกจังหวัด") {
        obj_replaytoken_day_province[event.source.userId] = event.replyToken
        replydata_covid_day()

      }
      else if (msg != "ผู้ติดเชื้อรายวันแยกจังหวัด" && event.source.userId in obj_replaytoken_day_province) {
        obj_userid_covid_day[event.source.userId] = { reply: event.replyToken, message: msg }
        number_Infected_peopleByprovince(msg)

      }

      else if (msg == "ระลอก 3 แยกจังหวัด") {
        // replyToken = event.replyToken
        obj_replaytoken[event.source.userId] = event.replyToken

        covid3_provice()
        // console.log(province_obj);
        // count22++;
      }
      else if (msg != "ระลอก 3 แยกจังหวัด" && event.source.userId in obj_replaytoken) {
        obj_userid[event.source.userId] = { reply: event.replyToken, message: msg }
        search_data(msg)
        // count22 = 0;
      } else {
        let messages1 = [
          {
            "type": "text",
            "text": "โปรดเรียกใช้คำสั่งฉัน! เช่น :\n- ผู้ติดเชื้อรายวัน\n- ผู้ติดเชื้อรายวันแยกจังหวัด\n- ระลอก 3 แยกจังหวัด\n- กราฟผู้ติดเชื้อ 1 สัปดาห์\n\nหมายเหตุ**\n1. ผู้ติดเชื้อรายวันแยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ประจำวัน แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n2. ระลอก 3 แยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ระลอก 3 (ตั้งแต่ 01/04/2021 –ปัจจุบัน) แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n3. กราฟผู้ติดเชื้อ 1 สัปดาห์ คือ กราฟแสดง 1 สัปดาห์ล่าสุด",

          }

        ];

        Post_data(event.replyToken, messages1)
      }





    } else {
      console.log(event);
      let messages1 = [
        {
          "type": "text",
          "text": "โปรดเรียกใช้คำสั่งฉัน! เช่น :\n- ผู้ติดเชื้อรายวัน\n- ผู้ติดเชื้อรายวันแยกจังหวัด\n- ระลอก 3 แยกจังหวัด\n- กราฟผู้ติดเชื้อ 1 สัปดาห์\n\nหมายเหตุ**\n1. ผู้ติดเชื้อรายวันแยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ประจำวัน แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n2. ระลอก 3 แยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ระลอก 3 (ตั้งแต่ 01/04/2021 –ปัจจุบัน) แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n3. กราฟผู้ติดเชื้อ 1 สัปดาห์ คือ กราฟแสดง 1 สัปดาห์ล่าสุด",

        }

      ];

      Post_data(event.replyToken, messages1)
    }
  }
  res.end();
});



let obj_replaytoken = {}, obj_userid = {}, obj_userid_covid_day = {}
  , obj_replaytoken_day = {}, obj_replaytoken_day_province = {}, objData_province = {}, obj_replaytoken_ripple = {}
  , search = "", body, province_obj = {};




async function covid_day() {

  let res = await fetch('https://covid19.ddc.moph.go.th/api/Cases/today-cases-all')
  let data_text = await res.text()

  let dataCovid = JSON.parse(data_text);
  let txn_date = dataCovid[0].txn_date;
  let new_case = comma2(String(dataCovid[0].new_case));
  let total_case = comma2(String(dataCovid[0].total_case));
  let new_death = comma2(String(dataCovid[0].new_death));
  let total_death = comma2(String(dataCovid[0].total_death));
  let new_recovered = comma2(String(dataCovid[0].new_recovered));
  let total_recovered = comma2(String(dataCovid[0].total_recovered));
  let update_date = "อัปเดตข้อมูลล่าสุด : " + dataCovid[0].update_date;

  let messages1 = [
    {
      "type": "flex",
      "size": "giga",
      "altText": "Covid",
      "contents": {

        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          // "backgroundColor": "#ffebcc",
          "contents": [

            {
              "type": "box",
              "layout": "baseline",
              "contents": [
                {
                  "type": "icon",
                  "url": "https://cdn-icons-png.flaticon.com/512/323/323281.png",
                  "size": "lg",
                },
                {
                  "type": "text",
                  "text": "รายงานโควิด-19",
                  "weight": "bold",
                  "size": "xl",
                  "margin": "md",

                },

              ]
            },
            {
              "type": "text",
              "text": "ประจำวันที่ :" + txn_date,
              "size": "xs",
              "color": "#555555",
              "wrap": true
            }, {
              "type": "separator",
              "margin": "xxl"
            },
            {
              "type": "box",
              "layout": "vertical",
              "margin": "xxl",
              "spacing": "sm",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ผู้ป่วยรายใหม่ :",
                      "size": "sm",
                      "color": "#555555",
                      "flex": 0
                    },

                    {
                      "type": "text",
                      "text": "+" + new_case + " ราย",
                      "size": "sm",
                      "color": "#ff4d4d",
                      "align": "end"
                    },

                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ผู้ป่วยสะสม :",
                      "size": "sm",
                      "color": "#555555",
                      "flex": 0
                    },
                    {
                      "type": "text",
                      "text": total_case + " ราย",
                      "size": "sm",
                      "color": "#ff4d4d",
                      "align": "end"
                    }
                  ]
                }, {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ผู้ป่วยเสียชีวิตรายใหม่ :",
                      "size": "sm",
                      "color": "#555555",
                      "flex": 0
                    },
                    {
                      "type": "text",
                      "text": "+" + new_death + " ราย",
                      "size": "sm",
                      "color": "#ff4d4d",
                      "align": "end"
                    }
                  ]
                }, {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ผู้ป่วยเสียชีวิตสะสม :",
                      "size": "sm",
                      "color": "#555555",
                      "flex": 0
                    },
                    {
                      "type": "text",
                      "text": total_death + " ราย",
                      "size": "sm",
                      "color": "#ff4d4d",
                      "align": "end"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ผู้ป่วยรักษาหายรายใหม่ :",
                      "size": "sm",
                      "color": "#555555",
                      "flex": 0
                    },
                    {
                      "type": "text",
                      "text": "+" + new_recovered + " ราย",
                      "size": "sm",
                      "color": "#00cc00",
                      "align": "end"
                    }
                  ]
                }, {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ผู้ป่วยรักษาหายสะสม :",
                      "size": "sm",
                      "color": "#555555",
                      "flex": 0
                    },
                    {
                      "type": "text",
                      "text": total_recovered + " ราย",
                      "size": "sm",
                      "color": "#00cc00",
                      "align": "end"
                    }
                  ]
                },


              ]

            }, {
              "type": "separator",
              "margin": "xxl"
            },

          ]
        },
        "footer": {
          "type": "box",
          // "backgroundColor": "#33cc33",
          "layout": "horizontal",
          "flex": 1,
          "contents": [


            {
              "type": "text",
              "text": update_date,
              "size": "sm",
              "color": "#3385ff",
              "align": "center",
              "contents": []
            }
          ]
        }
      }


    },
    {
      "type": "text",
      "text": "โปรดเรียกใช้คำสั่งฉัน! เช่น :\n- ผู้ติดเชื้อรายวัน\n- ผู้ติดเชื้อรายวันแยกจังหวัด\n- ระลอก 3 แยกจังหวัด\n- กราฟผู้ติดเชื้อ 1 สัปดาห์\n\nหมายเหตุ**\n1. ผู้ติดเชื้อรายวันแยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ประจำวัน แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n2. ระลอก 3 แยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ระลอก 3 (ตั้งแต่ 01/04/2021 –ปัจจุบัน) แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n3. กราฟผู้ติดเชื้อ 1 สัปดาห์ คือ กราฟแสดง 1 สัปดาห์ล่าสุด"

    }

  ];
  // console.log(obj_replaytoken_day);
  for (let replay in obj_replaytoken_day) {
    Post_data(obj_replaytoken_day[replay], messages1)
    delete obj_replaytoken_day[replay]
  }
}

async function covid3_provice() {


  let res = await fetch('https://covid19.ddc.moph.go.th/api/Cases/timeline-cases-by-provinces')
  let data_text = await res.text()
  let CovidProvince3 = JSON.parse(data_text);
  let i
  for (i = 0; i < 77; i++) {

    for (let r = i; r < CovidProvince3.length; r += 78) {

      province_obj[CovidProvince3[r].province] = {
        province: CovidProvince3[r].province,
        sum_total_patient: CovidProvince3[r].total_case,
        sum_death_patient: CovidProvince3[r].total_death,
        sum_total_inthai: CovidProvince3[r].total_case_excludeabroad,
        Date_3: CovidProvince3[0].txn_date,
        new_update: CovidProvince3[r].update_date,
        new_update_nohour: CovidProvince3[r].update_date
      }


    }

    province_obj[CovidProvince3[i].province].sum_total_patient = comma3(String(province_obj[CovidProvince3[i].province].sum_total_patient))
    province_obj[CovidProvince3[i].province].sum_death_patient = comma3(String(province_obj[CovidProvince3[i].province].sum_death_patient))
    province_obj[CovidProvince3[i].province].sum_total_inthai = comma3(String(province_obj[CovidProvince3[i].province].sum_total_inthai))

    sum = 0;

    let new_update2 = province_obj[CovidProvince3[i].province].new_update_nohour
    new_update2 = new_update2.split(' ');
    province_obj[CovidProvince3[i].province].new_update_nohour = new_update2[0]
    // console.log(province_obj[CovidProvince3[i].province]);
    // console.log(new_update2[0]);
  }

  console.log("------------------")

  let messages1 = [
    {
      "type": "text", // ①
      "text": "โปรดพิมพ์ชื่อจังหวัด(เป็นชื่อเต็ม) ยกตัวอย่างเช่น :\n- กรุงเทพมหานคร\n- สุรินทร์\n- เชียงใหม่\n- ภูเก็ต \nหมายเหตุ** ค้นหาตามชื่อ 77 จังหวัดได้",
      "quickReply": { // ②
        "items": [
          {
            "type": "action", // ③
            "imageUrl": "https://image.flaticon.com/icons/png/512/2785/2785819.png",
            "action": {
              "type": "message",
              "label": "กรุงเทพ",
              "text": "กรุงเทพมหานคร"
            }
          },
          {
            "type": "action", // ③
            "imageUrl": "https://image.flaticon.com/icons/png/512/2785/2785819.png",
            "action": {
              "type": "message",
              "label": "สุรินทร์",
              "text": "สุรินทร์"
            }
          }
          ,
          {
            "type": "action", // ③
            "imageUrl": "https://image.flaticon.com/icons/png/512/2785/2785819.png",
            "action": {
              "type": "message",
              "label": "เชียงใหม่",
              "text": "เชียงใหม่"
            }
          }
          ,
          {
            "type": "action", // ③
            "imageUrl": "https://image.flaticon.com/icons/png/512/2785/2785819.png",
            "action": {
              "type": "message",
              "label": "ภูเก็ต",
              "text": "ภูเก็ต"
            }
          }


        ]
      }
    }

  ];
  for (let replay in obj_replaytoken) {
    Post_data2(obj_replaytoken[replay], messages1)

  }
  console.log(obj_replaytoken);
}

async function search_data(msg) {
  search = msg
  let messages2 = []
  if (province_obj[search] != undefined) {

    messages2 = [
      {
        "type": "flex",
        "size": "giga",
        "altText": "Covid",
        "contents": {

          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "vertical",
            // "backgroundColor": "#ffebcc",
            "contents": [

              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://cdn-icons-png.flaticon.com/512/323/323281.png",
                    "size": "lg",
                  },
                  {
                    "type": "text",
                    "text": "รายงานโควิด-19 ระลอกที่ 3",
                    "weight": "bold",
                    "size": "lg",
                    "margin": "md",

                  },

                ]
              },
              {
                "type": "text",
                "text": "วันที่ " + province_obj[search].Date_3 + " ถึง " + province_obj[search].new_update_nohour,
                "size": "xs",
                // "color": "#aaaaaa",
                "wrap": true
              }, {
                "type": "separator",
                "margin": "xxl"
              },
              {
                "type": "box",
                "layout": "vertical",
                "margin": "xxl",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "จังหวัด :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0
                      },

                      {
                        "type": "text",
                        "text": search,
                        "size": "sm",
                        // "color": "#ff4d4d",
                        "align": "end"
                      },

                    ]
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ผู้ป่วยรวมทั้งหมด :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0
                      },
                      {
                        "type": "text",
                        "text": province_obj[search].sum_total_patient + " ราย",
                        "size": "sm",
                        "color": "#ff4d4d",
                        "align": "end"
                      }
                    ]
                  }, {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ผู้ป่วยคนไทยทั้งหมด :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0
                      },
                      {
                        "type": "text",
                        "text": province_obj[search].sum_total_inthai + " ราย",
                        "size": "sm",
                        "color": "#ff4d4d",
                        "align": "end"
                      }
                    ]
                  }, {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ผู้ป่วยเสียชีวิตทั้งหมด :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0
                      },
                      {
                        "type": "text",
                        "text": province_obj[search].sum_death_patient + " ราย",
                        "size": "sm",
                        "color": "#ff4d4d",
                        "align": "end"
                      }
                    ]
                  }


                ]

              }, {
                "type": "separator",
                "margin": "xxl"
              },

            ]
          },
          "footer": {
            "type": "box",
            // "backgroundColor": "#33cc33",
            "layout": "horizontal",
            "flex": 1,
            "contents": [


              {
                "type": "text",
                "text": "อัปเดตข้อมูลล่าสุด : " + province_obj[search].new_update,
                "size": "sm",
                "color": "#3385ff",
                "align": "center",
                "contents": []
              }
            ]
          },

        },


      },
      {
        "type": "text",
        "text": "โปรดเรียกใช้คำสั่งฉัน! เช่น :\n- ผู้ติดเชื้อรายวัน\n- ผู้ติดเชื้อรายวันแยกจังหวัด\n- ระลอก 3 แยกจังหวัด\n- กราฟผู้ติดเชื้อ 1 สัปดาห์\n\nหมายเหตุ**\n1. ผู้ติดเชื้อรายวันแยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ประจำวัน แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n2. ระลอก 3 แยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ระลอก 3 (ตั้งแต่ 01/04/2021 –ปัจจุบัน) แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n3. กราฟผู้ติดเชื้อ 1 สัปดาห์ คือ กราฟแสดง 1 สัปดาห์ล่าสุด",

      }
    ];

  } else {
    messages2 = [
      {
        "type": 'text',
        "text": "ไม่พบจังหวัดที่ท่านต้องการค้นหา!",
        "color": "#ff0000"
      },
      {
        "type": "text",
        "text": "โปรดเรียกใช้คำสั่งฉัน! เช่น :\n- ผู้ติดเชื้อรายวัน\n- ผู้ติดเชื้อรายวันแยกจังหวัด\n- ระลอก 3 แยกจังหวัด\n- กราฟผู้ติดเชื้อ 1 สัปดาห์\n\nหมายเหตุ**\n1. ผู้ติดเชื้อรายวันแยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ประจำวัน แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n2. ระลอก 3 แยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ระลอก 3 (ตั้งแต่ 01/04/2021 –ปัจจุบัน) แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n3. กราฟผู้ติดเชื้อ 1 สัปดาห์ คือ กราฟแสดง 1 สัปดาห์ล่าสุด",

      }

    ];

  }
  for (let a in obj_userid) {
    //  if (obj_userid == obj_userid[a] && Object.values(obj_userid)[a] == search) {
    Post_data2(obj_userid[a].reply, messages2)
    //  }
    delete obj_userid[a]
    delete obj_replaytoken[a]
  }
  // console.log(obj_replaytoken);
  //  console.log(obj_userid);
}


// ***************************************************************************************************************
async function replydata_covid_day() {

  let response = await fetch('https://covid19.ddc.moph.go.th/api/Cases/today-cases-by-provinces') //ลิงค์เว็บ
  let rawData = await response.text() //อ่านผลลัพธ์
  let objectData = JSON.parse(rawData) //ทำข้อมูลเป็น object
  for (let i = 0; i < 77; i++) {

    objData_province[objectData[i].province] = {
      province: objectData[i].province,
      date_1: objectData[i].txn_date,
      new_case: objectData[i].new_case,// ผู้ป่วยรายใหม่
      new_case_excludeabroad: objectData[i].new_case_excludeabroad, // ผู้ป่วยรายใหม่ไม่รวมต่างประเทศ
      news_case_come_from_abroad: objectData[i].new_case - objectData[i].new_case_excludeabroad, // ผู้ป่วยรายใหม่ต่างประเทศ
      total_case: objectData[i].total_case,// ผู้ป่วยสะสม
      new_death: objectData[i].new_death,
      total_death: objectData[i].total_death,

      update_date: objectData[i].update_date
    }

    objData_province[objectData[i].province].new_case = comma(String(objData_province[objectData[i].province].new_case))
    objData_province[objectData[i].province].new_case_excludeabroad = comma(String(objData_province[objectData[i].province].new_case_excludeabroad))
    objData_province[objectData[i].province].news_case_come_from_abroad = comma(String(objData_province[objectData[i].province].news_case_come_from_abroad))
    objData_province[objectData[i].province].total_case = comma(String(objData_province[objectData[i].province].total_case))

    objData_province[objectData[i].province].new_death = comma(String(objData_province[objectData[i].province].new_death))
    objData_province[objectData[i].province].total_death = comma(String(objData_province[objectData[i].province].total_death))
  }

  let messages1 = [
    {
      "type": "text", // ①
      "text": "โปรดพิมพ์ชื่อจังหวัด(เป็นชื่อเต็ม) ยกตัวอย่างเช่น :\n- กรุงเทพมหานคร\n- สุรินทร์\n- เชียงใหม่\n- ภูเก็ต \nหมายเหตุ** ค้นหาตามชื่อ 77 จังหวัดได้",
      "quickReply": { // ②
        "items": [
          {
            "type": "action", // ③
            "imageUrl": "https://image.flaticon.com/icons/png/512/2785/2785819.png",
            "action": {
              "type": "message",
              "label": "กรุงเทพ",
              "text": "กรุงเทพมหานคร"
            }
          },
          {
            "type": "action", // ③
            "imageUrl": "https://image.flaticon.com/icons/png/512/2785/2785819.png",
            "action": {
              "type": "message",
              "label": "สุรินทร์",
              "text": "สุรินทร์"
            }
          }
          ,
          {
            "type": "action", // ③
            "imageUrl": "https://image.flaticon.com/icons/png/512/2785/2785819.png",
            "action": {
              "type": "message",
              "label": "เชียงใหม่",
              "text": "เชียงใหม่"
            }
          }
          ,
          {
            "type": "action", // ③
            "imageUrl": "https://image.flaticon.com/icons/png/512/2785/2785819.png",
            "action": {
              "type": "message",
              "label": "ภูเก็ต",
              "text": "ภูเก็ต"
            }
          }


        ]
      }
    }


  ];
  for (let replay in obj_replaytoken_day_province) {
    Post_data2(obj_replaytoken_day_province[replay], messages1)

  }
}



async function number_Infected_peopleByprovince(msg) {

  let search = msg
  let messages1 = []
  if (objData_province[search] != undefined) {
    // console.log("เข้าาาาาาาาาาา  ");
    messages1 = [
      {
        "type": "flex",
        "size": "giga",
        "altText": "Covid",
        "contents": {

          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "vertical",
            // "backgroundColor": "#ffebcc",
            "contents": [

              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://cdn-icons-png.flaticon.com/512/323/323281.png",
                    "size": "lg",
                  },
                  {

                    "type": "text",
                    "text": "รายงานโควิด-19 แยกตามจังหวัด",
                    "weight": "bold",
                    "size": "md",
                    "margin": "md",
                    "wrap": true

                  }
                ]
              },
              {
                "type": "text",
                "text": "ประจำวันที่ : " + objData_province[search].date_1,
                "size": "xs",
                "color": "#555555",
                "wrap": true
              },
              {
                "type": "text",
                "text": "หมายเหตุ**\nตปท. คือ ต่างประเทศ",
                "size": "xs",
                "color": "#ff4d4d",
                "wrap": true
              },
              {
                "type": "separator",
                "margin": "xxl"
              },
              {
                "type": "box",
                "layout": "vertical",
                "margin": "xxl",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "จังหวัด :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0
                      },

                      {
                        "type": "text",
                        "text": objData_province[search].province,
                        "size": "sm",
                        "color": "#555555",
                        "align": "end",
                        "wrap": true
                      },

                    ]
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ผู้ป่วยรายใหม่ :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0,
                        "wrap": true
                      },
                      {
                        "type": "text",
                        "text": "+" + objData_province[search].new_case + " ราย",
                        "size": "sm",
                        "color": "#ff4d4d",
                        "align": "end",
                        "wrap": true
                      }
                    ]
                  },


                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ผู้ป่วยรายใหม่(ตปท.) :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0,
                        "wrap": true
                      },
                      {
                        "type": "text",
                        "text": "+" + objData_province[search].news_case_come_from_abroad + " ราย",
                        "size": "sm",
                        "color": "#ff4d4d",
                        "align": "end",
                        "wrap": true
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ผู้ป่วยสะสม :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0,
                        "wrap": true
                      },
                      {
                        "type": "text",
                        "text": objData_province[search].total_case + " ราย",
                        "size": "sm",
                        "color": "#ff4d4d",
                        "align": "end",
                        "wrap": true
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ผู้ป่วยเสียชีวิตรายใหม่ :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0,
                        "wrap": true
                      },
                      {
                        "type": "text",
                        "text": "+" + objData_province[search].new_death + " ราย",
                        "size": "sm",
                        "color": "#ff4d4d",
                        "align": "end",
                        "wrap": true
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ผู้ป่วยเสียชีวิตสะสม :",
                        "size": "sm",
                        "color": "#555555",
                        "flex": 0,
                        "wrap": true
                      },
                      {
                        "type": "text",
                        "text": objData_province[search].total_death + " ราย",
                        "size": "sm",
                        "color": "#ff4d4d",
                        "align": "end",
                        "wrap": true
                      }
                    ]
                  }

                ]

              }, {
                "type": "separator",
                "margin": "xxl"
              },

            ]
          },
          "footer": {
            "type": "box",
            // "backgroundColor": "#33cc33",
            "layout": "horizontal",
            "flex": 1,
            "contents": [


              {
                "type": "text",
                "text": "อัปเดตข้อมูลล่าสุด : " + objData_province[search].update_date,
                "size": "sm",
                "color": "#3385ff",
                "align": "center",

              }
            ]
          }
        }


      },
      {
        "type": "text",
        "text": "โปรดเรียกใช้คำสั่งฉัน! เช่น :\n- ผู้ติดเชื้อรายวัน\n- ผู้ติดเชื้อรายวันแยกจังหวัด\n- ระลอก 3 แยกจังหวัด\n- กราฟผู้ติดเชื้อ 1 สัปดาห์\n\nหมายเหตุ**\n1. ผู้ติดเชื้อรายวันแยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ประจำวัน แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n2. ระลอก 3 แยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ระลอก 3 (ตั้งแต่ 01/04/2021 –ปัจจุบัน) แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n3. กราฟผู้ติดเชื้อ 1 สัปดาห์ คือ กราฟแสดง 1 สัปดาห์ล่าสุด",

      }

    ];
  } else {
    messages1 = [
      {
        "type": 'text',
        "text": "ไม่พบจังหวัดที่ท่านต้องการค้นหา!",
        "color": "#ff0000"
      },
      {
        "type": "text", // ①
        "text": "โปรดเรียกใช้คำสั่งฉัน! เช่น :\n- ผู้ติดเชื้อรายวัน\n- ผู้ติดเชื้อรายวันแยกจังหวัด\n- ระลอก 3 แยกจังหวัด\n- กราฟผู้ติดเชื้อ 1 สัปดาห์\n\nหมายเหตุ**\n1. ผู้ติดเชื้อรายวันแยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ประจำวัน แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n2. ระลอก 3 แยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ระลอก 3 (ตั้งแต่ 01/04/2021 –ปัจจุบัน) แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n3. กราฟผู้ติดเชื้อ 1 สัปดาห์ คือ กราฟแสดง 1 สัปดาห์ล่าสุด",

      }

    ];

  }

  for (let replay in obj_userid_covid_day) {
    // if (obj_userid_covid_day[replay].message == search) {
    Post_data(obj_userid_covid_day[replay].reply, messages1)
    delete obj_userid_covid_day[replay]
    delete obj_replaytoken_day_province[replay]
    // }

  }
  console.log(obj_userid_covid_day);
  console.log(obj_replaytoken_day_province);
}

async function covid19_ripple3_now() {
  let response_data = await fetch('https://covid19.ddc.moph.go.th/api/Cases/timeline-cases-all') //ลิงค์เว็บ
  let rawData_covid = await response_data.text() //อ่านผลลัพธ์
  let objData_ripple3_now = JSON.parse(rawData_covid) //ทำข้อมูลเป็น object


  let sum_newcase = 0;
  let arr_height = []
  let arr_date = []
  let check_num = 0, max_height = 0
  for (let i = objData_ripple3_now.length - 7; i < objData_ripple3_now.length; i++) {
    sum_newcase += objData_ripple3_now[i].new_case

    var objDate = new Date(objData_ripple3_now[i].txn_date);

    arr_date.push(objDate.toLocaleString("th", { day: "numeric" }) + ' ' + objDate.toLocaleString("th", { month: "short" }));
    if (max_height == 0) {
      max_height = objData_ripple3_now[i].new_case
    }
    if (objData_ripple3_now[i].new_case > max_height) {
      max_height = objData_ripple3_now[i].new_case

    }

  }

  let avg = parseInt(sum_newcase / 7)

  for (let i = objData_ripple3_now.length - 7; i < objData_ripple3_now.length; i++) {
    arr_height.push(String((objData_ripple3_now[i].new_case * 90) / max_height) + "%")
  }





  let mes = [
    {
      "type": "flex",
      "size": "giga",
      "altText": "Covid",
      "contents": {
        "type": "bubble",
        "header": {
          "type": "box",
          "layout": "baseline",
          "contents": [
            {
              "type": "icon",
              "url": "https://cdn-icons-png.flaticon.com/512/323/323281.png",
              "position": "relative",
              "offsetStart": "20px",
              "size": "lg",
              "offsetTop": "4px"
            },
            {
              "type": "text",
              "text": "กราฟจำนวนผู้ติดเชื้อ 1 สัปดาห์",
              "align": "center",
              "adjustMode": "shrink-to-fit",
              "size": "md",
              "color": "#000000"
            }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "text",
                              "text": String((objData_ripple3_now[objData_ripple3_now.length - 7].new_case / 1000)).slice(0, 4) + "k",
                              "size": "xxs",
                              "color": "#000000",
                              "align": "center",
                              "wrap": true
                            }
                          ],
                          "width": "100%",
                          "height": "15px",
                          "justifyContent": "center",
                          "alignItems": "center"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [],
                          "width": "100%",
                          "backgroundColor": "#DC143C",
                          "flex": 1,
                          "height": arr_height[0],
                          "alignItems": "center",
                          "justifyContent": "center"
                        }
                      ],
                      "flex": 2,
                      "height": "100%",
                      "width": "30px",
                      "justifyContent": "flex-end",
                      "alignItems": "flex-end"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "text",
                              "text": String((objData_ripple3_now[objData_ripple3_now.length - 6].new_case / 1000)).slice(0, 4) + "k",
                              "size": "xxs",
                              "color": "#000000",
                              "align": "center"
                            }
                          ],
                          "width": "100%",
                          "height": "15px",
                          "justifyContent": "center",
                          "alignItems": "center"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [],
                          "width": "100%",
                          "backgroundColor": "#DC143C",
                          "flex": 1,
                          "height": arr_height[1],
                          "alignItems": "flex-end"
                        }
                      ],
                      "flex": 2,
                      "height": "100%",
                      "width": "30px",
                      "justifyContent": "flex-end",
                      "alignItems": "flex-end"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "text",
                              "text": String((objData_ripple3_now[objData_ripple3_now.length - 5].new_case / 1000)).slice(0, 4) + "k",
                              "size": "xxs",
                              "color": "#000000",
                              "align": "center"
                            }
                          ],
                          "width": "100%",
                          "height": "15px",
                          "justifyContent": "center",
                          "alignItems": "center"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [],
                          "width": "100%",
                          "backgroundColor": "#DC143C",
                          "flex": 1,
                          "height": arr_height[2],
                          "alignItems": "flex-end"
                        }
                      ],
                      "flex": 2,
                      "height": "100%",
                      "width": "30px",
                      "justifyContent": "flex-end",
                      "alignItems": "flex-end"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "text",
                              "text": String((objData_ripple3_now[objData_ripple3_now.length - 4].new_case / 1000)).slice(0, 4) + "k",
                              "size": "xxs",
                              "color": "#000000",
                              "align": "center"
                            }
                          ],
                          "width": "100%",
                          "height": "15px",
                          "justifyContent": "center",
                          "alignItems": "center"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [],
                          "width": "100%",
                          "backgroundColor": "#DC143C",
                          "flex": 1,
                          "height": arr_height[3],
                          "alignItems": "flex-end"
                        }
                      ],
                      "flex": 2,
                      "height": "100%",
                      "width": "30px",
                      "justifyContent": "flex-end",
                      "alignItems": "flex-end"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "text",
                              "text": String((objData_ripple3_now[objData_ripple3_now.length - 3].new_case / 1000)).slice(0, 4) + "k",
                              "size": "xxs",
                              "color": "#000000",
                              "align": "center"
                            }
                          ],
                          "width": "100%",
                          "height": "15px",
                          "justifyContent": "center",
                          "alignItems": "center"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [],
                          "width": "100%",
                          "backgroundColor": "#DC143C",
                          "flex": 1,
                          "height": arr_height[4],
                          "alignItems": "flex-end"
                        }
                      ],
                      "flex": 2,
                      "height": "100%",
                      "width": "30px",
                      "justifyContent": "flex-end",
                      "alignItems": "flex-end"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "text",
                              "text": String((objData_ripple3_now[objData_ripple3_now.length - 2].new_case / 1000)).slice(0, 4) + "k",
                              "size": "xxs",
                              "color": "#000000",
                              "align": "center"
                            }
                          ],
                          "width": "100%",
                          "height": "15px",
                          "justifyContent": "center",
                          "alignItems": "center"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [],
                          "width": "100%",
                          "backgroundColor": "#DC143C",
                          "flex": 1,
                          "height": arr_height[5],
                          "alignItems": "flex-end"
                        }
                      ],
                      "flex": 2,
                      "height": "100%",
                      "width": "30px",
                      "justifyContent": "flex-end",
                      "alignItems": "flex-end"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "text",
                              "text": String((objData_ripple3_now[objData_ripple3_now.length - 1].new_case / 1000)).slice(0, 4) + "k",
                              "size": "xxs",
                              "color": "#000000",
                              "align": "center"
                            }
                          ],
                          "width": "100%",
                          "height": "15px",
                          "justifyContent": "center",
                          "alignItems": "center"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [],
                          "width": "100%",
                          "backgroundColor": "#DC143C",
                          "flex": 1,
                          "height": arr_height[6],
                          "alignItems": "flex-end"
                        }
                      ],
                      "flex": 2,
                      "height": "100%",
                      "width": "30px",
                      "justifyContent": "flex-end",
                      "alignItems": "flex-end"
                    }
                  ],
                  "height": "200px",
                  "width": "100%",
                  "justifyContent": "space-evenly",
                  "alignItems": "flex-end"
                }
              ],
              "justifyContent": "flex-start",
              "width": "270px",
              "alignItems": "flex-end",
              "margin": "xl"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "separator",
                  "color": "#000000"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": arr_date[0],
                          "align": "center",
                          "size": "xxs",
                          "wrap": true
                        }
                      ],
                      "backgroundColor": "#ffffff",
                      "height": "40px",
                      "width": "30px",
                      "justifyContent": "center",
                      "alignItems": "center"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": arr_date[1],
                          "align": "center",
                          "size": "xxs",
                          "wrap": true
                        }
                      ],
                      "backgroundColor": "#ffffff",
                      "height": "40px",
                      "width": "30px",
                      "justifyContent": "center",
                      "alignItems": "center"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": arr_date[2],
                          "align": "center",
                          "size": "xxs",
                          "wrap": true
                        }
                      ],
                      "backgroundColor": "#ffffff",
                      "height": "40px",
                      "width": "30px",
                      "justifyContent": "center",
                      "alignItems": "center"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": arr_date[3],
                          "align": "center",
                          "size": "xxs",
                          "wrap": true
                        }
                      ],
                      "backgroundColor": "#ffffff",
                      "height": "40px",
                      "width": "30px",
                      "justifyContent": "center",
                      "alignItems": "center"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": arr_date[4],
                          "align": "center",
                          "size": "xxs",
                          "wrap": true
                        }
                      ],
                      "backgroundColor": "#ffffff",
                      "height": "40px",
                      "width": "30px",
                      "justifyContent": "center",
                      "alignItems": "center"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": arr_date[5],
                          "align": "center",
                          "size": "xxs",
                          "wrap": true
                        }
                      ],
                      "backgroundColor": "#ffffff",
                      "height": "40px",
                      "width": "30px",
                      "justifyContent": "center",
                      "alignItems": "center"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": arr_date[6],
                          "align": "center",
                          "size": "xxs",
                          "wrap": true
                        }
                      ],
                      "backgroundColor": "#ffffff",
                      "height": "40px",
                      "width": "30px",
                      "justifyContent": "center",
                      "alignItems": "center"
                    }
                  ],
                  "justifyContent": "space-evenly",
                  "alignItems": "center",
                  "width": "100%"
                }
              ],
              "width": "270px"
            }
          ],
          "justifyContent": "center",
          "alignItems": "center",
          "width": "300px",
          "height": "260px",
          "position": "relative"
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "contents": [],
              "width": "20px",
              "height": "10px",
              "backgroundColor": "#DC143C",
              "offsetStart": "15px",
              "flex": 1,
              "offsetBottom": "5px"
            },
            {
              "type": "text",
              "text": "จำนวนผู้ติดเชื้อ ",
              "offsetStart": "22px",
              "size": "xs",
              "offsetBottom": "4px",
              "wrap": true,
              "flex": 2
            },
            {
              "type": "text",
              "text": "เฉลี่ย : " + avg.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " คน/สัปดาห์",
              "flex": 3,
              "size": "xs",
              "offsetBottom": "4px",
              "offsetStart": "18px",
              "wrap": true
            }
          ],
          "width": "100%",
          "height": "70px",
          "justifyContent": "center",
          "alignItems": "center"
        }
      }
    },
    {
      "type": "text", // ①
      "text": "โปรดเรียกใช้คำสั่งฉัน! เช่น :\n- ผู้ติดเชื้อรายวัน\n- ผู้ติดเชื้อรายวันแยกจังหวัด\n- ระลอก 3 แยกจังหวัด\n- กราฟผู้ติดเชื้อ 1 สัปดาห์\n\nหมายเหตุ**\n1. ผู้ติดเชื้อรายวันแยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ประจำวัน แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n2. ระลอก 3 แยกจังหวัด คือ รายงานสถานการณ์ COVID-19 ระลอก 3 (ตั้งแต่ 01/04/2021 –ปัจจุบัน) แยกตามรายจังหวัด (ค้นหาตามชื่อจังหวัด)\n3. กราฟผู้ติดเชื้อ 1 สัปดาห์ คือ กราฟแสดง 1 สัปดาห์ล่าสุด",

    }
  ]
  // console.log(obj_replaytoken_day);
  for (let replay in obj_replaytoken_ripple) {
    Post_data(obj_replaytoken_ripple[replay], mes)
    delete obj_replaytoken_ripple[replay]
  }

}


async function Post_data(replaytoken, messages) {

  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer vmJxnNgBzOyBzB8mfR19RngdMg9buUj9biUMwVs+J6G9AKe1NdRscybj7VB81W+wesoslqUH33YIif1fpxF4yUz6MxZkuKCMQEBeWYj6eoA9oajYK9DBTG/5gngMm9+MRCEUm3wdxR2SL5HggUOt9QdB04t89/1O/w1cDnyilFU='
  }

  body = JSON.stringify({
    replyToken: replaytoken,
    messages: messages

  })

  await request.post({
    url: 'https://api.line.me/v2/bot/message/reply',
    headers: headers,
    body: body
  }, (err, res, body) => {
    console.log('err = ' + err);
    console.log('status = ' + res.statusCode);

  })

}

async function Post_data2(obj_replaytoken, messages) {

  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer vmJxnNgBzOyBzB8mfR19RngdMg9buUj9biUMwVs+J6G9AKe1NdRscybj7VB81W+wesoslqUH33YIif1fpxF4yUz6MxZkuKCMQEBeWYj6eoA9oajYK9DBTG/5gngMm9+MRCEUm3wdxR2SL5HggUOt9QdB04t89/1O/w1cDnyilFU='
  }

  body = JSON.stringify({
    replyToken: obj_replaytoken,
    messages: messages

  })

  await request.post({
    url: 'https://api.line.me/v2/bot/message/reply',
    headers: headers,
    body: body
  }, (err, res, body) => {
    console.log('err = ' + err);
    console.log('status = ' + res.statusCode);

  })

}

function comma(data_covid) {

  let count_all = data_covid.length, c = "", b = "";

  if (data_covid.length > 3) {
    for (let i = 0; i < data_covid.length; i++) {
      count_all--;
      c += data_covid.charAt(count_all);
      if ((i + 1) % 3 == 0 && i != data_covid.length - 1) {
        c += ",";
      }

    }
    for (let num = c.length; num >= 0; num--) {
      b += c.charAt(num);
      data_covid = b;
    }



  }
  return data_covid;
}

function comma2(data_covid) {

  let count_all = data_covid.length, c = "", b = "";

  if (data_covid.length > 3) {
    for (let i = 0; i < data_covid.length; i++) {
      count_all--;
      c += data_covid.charAt(count_all);
      if ((i + 1) % 3 == 0 && i != data_covid.length - 1) {
        c += ",";
      }

    }
    for (let num = c.length; num >= 0; num--) {
      b += c.charAt(num);
      data_covid = b;
    }



  }
  return data_covid;
}
function comma3(data_covid) {


  let count_all = data_covid.length, c = "", b = "";

  if (data_covid.length > 3) {
    for (let i = 0; i < data_covid.length; i++) {
      count_all--;
      c += data_covid.charAt(count_all);
      if ((i + 1) % 3 == 0 && i != data_covid.length - 1) {
        c += ",";
      }

    }
    for (let num = c.length; num >= 0; num--) {
      b += c.charAt(num);
      data_covid = b;
    }



  }
  return data_covid;
}

app.listen(PORT, function () {
  console.log('Server started: http://localhost:' + PORT + '/')

})