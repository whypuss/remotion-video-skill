#!/usr/bin/env python3
"""Generate 46 Cantonese audio segments for podcast video.
Usage: cd /tmp/remotion-demo && /usr/bin/python3 /tmp/gen_audio.py
Output: public/audio/seg_XX_{y,m}.m4a
"""
import subprocess, json, os, glob

segments = [
    (0, 'y', "zh-HK-WanLungNeural", "各位聽眾，大家好，歡迎收聽今集嘅節目，我係Y貓。今日我哋嘅心情，同全澳市民一樣，都係非常之沉重，非常之痛心。"),
    (1, 'm', "zh-HK-HiuMaanNeural", "大家好，我係momo。相信好多澳門人，特別係做父母嘅聽眾，近日個心都係揦住揦住痛。青洲大馬路發生嗰宗嚴重交通事故，真係令到成個社會都籠罩住一種哀傷，同埋極度強烈嘅憤怒。"),
    (2, 'y', "zh-HK-WanLungNeural", "無錯。喺夜晚約莫八點十八分，青洲大馬路近北區警司處、大明閣附近嘅行人斑馬線，一個年僅十歲嘅本澳男童，規規矩矩咁過緊馬路，竟然被一架私家車猛烈撞倒，仲要慘遭輾過。"),
    (3, 'm', "zh-HK-HiuMaanNeural", "一個十歲嘅生命，就咁樣喺斑馬線上面消失。佢可能啱啱食完晚飯，可能準備緊聽日返學嘅功課，可能仲同緊爸爸媽媽講緊學校發生嘅趣事，但係一切都戛然而止。"),
    (4, 'y', "zh-HK-WanLungNeural", "單新聞一出，成個澳門嘅網上討論區、各大社交平台，甚至乎係街市、茶餐廳，市民嘅反應除咗哀悼，更多嘅係憤怒，係無比嘅憤怒！"),
    (5, 'm', "zh-HK-HiuMaanNeural", "呢三個字，無讓先，真係深深刺痛咗每一位市民嘅神經。點解市民會咁憤怒？因為我哋日日教啲細路仔，過馬路要行斑馬線，見到斑馬線就代表安全，社會嘅法律同規則係會保護你嘅。"),
    (6, 'y', "zh-HK-WanLungNeural", "所以今日，我哋必須要喺節目入面，反覆強調一個最基本、最無可爭辯嘅鐵律，就係斑馬線前要減速！斑馬線前一定要減速！"),
    (7, 'm', "zh-HK-HiuMaanNeural", "依家好多司機有一種好恐怖、好畸形嘅心理，就係見到前面斑馬線有人準備過，佢第一時間唔係踩迫力減速，而係踩油門加速。"),
    (8, 'y', "zh-HK-WanLungNeural", "斑馬線前要減速，係絕對無得妥協嘅基本道德同法律底線。好多司機出咗事就賴，話視線死角呀，話A柱阻住視線呀，話條街太暗睇唔清呀。"),
    (9, 'm', "zh-HK-HiuMaanNeural", "呢種駕駛態度嘅墮落，真係令到好多老一輩嘅澳門人覺得好唏噓，亦都覺得好恐怖。Y貓，你記唔記得我哋以前嘅澳門？"),
    (10, 'y', "zh-HK-WanLungNeural", "係呀，以前嘅澳門，生活節奏無依家咁急促，人與人之間嘅包容度高好多。但係近日，我哋睇到嘅係呢種讓車禮貌直線下降。"),
    (11, 'm', "zh-HK-HiuMaanNeural", "呢個的确係市民熱烈討論嘅一個痛點。內地某啲城市，因為人口極多，車輛極多，道路設計極度複雜，佢哋嘅駕駛文化長期處於一種零和博弈嘅狀態。"),
    (12, 'y', "zh-HK-WanLungNeural", "呢個就係社會學上面典型嘅破窗效應，亦即係劣幣驅逐良幣。當你每一日喺馬路上，見到身邊啲車全部都係左穿右插，見到斑馬線當睇唔到直衝過去，如果你自己乖乖地停低讓行人，後面架車可能狂響咹催你。"),
    (13, 'm', "zh-HK-HiuMaanNeural", "不過，我哋亦都要理性咁問自己一個問題，有網民提出，回歸前，或者駕照互認未實施之前，澳門係咪就完全無小朋友喺交通事故中傷亡呢？"),
    (14, 'y', "zh-HK-WanLungNeural", "無錯，將問題簡單化並唔能夠解決問題。但係點解今次市民嘅憤怒會去到咁致極點呢？因為大家感覺到嘅，係成個社會嘅駕駛底線已經全面崩壞。"),
    (15, 'm', "zh-HK-HiuMaanNeural", "講到分心駕駛，呢個真係另一個足以致命嘅元兇。一架車以時速四十公里行駛，你只要低頭望一望部手機兩秒鐘，架車已經盲目向前衝咗超過二十米。"),
    (16, 'y', "zh-HK-WanLungNeural", "除咗司機個人嘅質素同埋文化衝擊之外，我哋亦都要從制度同硬件設施去深刻反思。青洲嗰一區，近年因為公屋落成，人口大幅增加，周邊設施不斷發展，車流量已經大咗非常多。"),
    (17, 'm', "zh-HK-HiuMaanNeural", "硬體設施要盡快改善，法律更加要大幅度加強阻嚇力。近日好多市民紛紛表達，依家澳門對於交通違規嘅罰則實在太輕，根本不痛不癢。"),
    (18, 'y', "zh-HK-WanLungNeural", "一個十歲小朋友嘅離世，代價實在太大太大。我哋絕對唔可以俾呢個無辜嘅生命白白犧牲。"),
    (19, 'm', "zh-HK-HiuMaanNeural", "全澳市民近日展現出嚟嘅憤怒，係對逝去生命嘅深切惋惜，亦係對自身同埋下一代安全嘅極度恐懼。"),
    (20, 'y', "zh-HK-WanLungNeural", "真係，請大家銘記於心。每一次當你架車駛近斑馬線，無論日頭定夜晚，無論有冇落雨，無論你覺得條街有冇人。請你務必將右腳放去煞車掣度。"),
    (21, 'm', "zh-HK-HiuMaanNeural", "你讓一讓，輸嘅只係人生中微不足道嘅三兩秒鐘。但係你挽救嘅，絕對係一條活生生、充滿未來嘅人命，同埋一個幸福完整嘅家庭。"),
    (22, 'y', "zh-HK-WanLungNeural", "願死者安息。希望全澳市民都可以守望相助，監督身邊嘅駕駛者。大家出入平安，揸車記住，生命無價，安全第一。多謝各位收聽今日嘅節目，我哋下集再見。"),
]

OUTDIR = "/tmp/remotion-demo/public/audio"
os.makedirs(OUTDIR, exist_ok=True)

# Delete old seg_ audio
for f in glob.glob(f"{OUTDIR}/seg_*.m4a"):
    os.remove(f)

results = []
for idx, speaker, voice, text in segments:
    label = 'y' if speaker == 'y' else 'm'
    path = f"{OUTDIR}/seg_{idx:02d}_{label}.m4a"
    subprocess.run(
        ["edge-tts", "--voice", voice, "--text", text, "--write-media", path],
        capture_output=True, timeout=60
    )
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", path],
        capture_output=True, text=True
    )
    try:
        dur = float(json.loads(result.stdout)["format"]["duration"])
    except:
        dur = 20.0
    results.append((idx, label, dur))
    print(f"seg_{idx:02d}_{label}: {dur:.3f}s")

total = sum(r[2] for r in results)
total_f = int(round(total * 30))
print(f"TOTAL: {total:.1f}s = {total/60:.2f}min = {total_f} frames")