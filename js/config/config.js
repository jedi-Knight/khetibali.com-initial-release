config = {
    api: {
        url: "data/",
        type: "GET",
        "location-summary-base-url": "location_summary/"
    },
    otherAPIs: {
        overpass: {
            url: "."
        }
    },
    "map-options":{
        "min-zoom": 1,
        "max-zoom": 22,
        "init-zoom": 7,
        "center": [28.09639, 82.66546]
    },
    "layer-styles":{
        "map-features":{
            "khet":{
                "color": "#666666",
                "weight": 4,
                "opacity": 1,
                "fillColor": "#999900",
                "fillOpacity": 1
            },
            "bari":{
                "color": "#66aa99",
                "weight": 4,
                "opacity": 1,
                "fillColor": "#33aa00",
                "fillOpacity": 1
            }
        }
    },
    "navbar": {
        title: "Khetibali",
        tabs: ["About Khetibali"]
    },
    "main-headings": ["People", "Process"],
    "start-screen-zoom-limits":{
        "max":12,
        "min": 7
    },
    "basemap-servers": [
        "http://{s}.tile.openstreetmap.org",
        "http://104.131.69.181/osm"
    ],
    "month-list":[
        "Baishak",
        "Jestha",
        "Ashar",
        "Shrawan",
        "Bhadra",
        "Ashwin",
        "Kartik",
        "Mangshir",
        "Paush",
        "Magh",
        "Falgun",
        "Chaitra"
    ],
    "seasons":{
        "0":"Baishak-Ashad",
        "3":"Shrawan-Aswin",
        "6":"Kartik-Poush",
        "9":"Magh-Chaitra"
    }
};

mainNavContentDef = {
    "About Khetibali": [
        
    ],
    "Bajrabarahi": [
        
    ],
    "People": [
        
    ],
    "Process": [
        
    ]
};