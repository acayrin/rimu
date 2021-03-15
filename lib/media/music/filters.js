const filters = {
    "3d": "apulsator=hz=0.125",
    bassboost: "bass=g=10,dynaudnorm=f=150:g=15",
    echo: "aecho=0.8:0.9:1000:0.3",
    flanger: "flanger",
    gate: "agate",
    haas: "haas",
    karaoke: "stereotools=mlev=0.1",
    nightcore: "asetrate=48000*1.15,aresample=48000,bass=g=5",
    reverse: "areverse",
    vaporwave: "asetrate=48000*0.8,aresample=48000,atempo=1.1",
    mcompand: "mcompand",
    phaser: "aphaser",
    tremolo: "tremolo",
    surround: "surround",
    earwax: "earwax",
}

module.exports = {
    filters
}