// const power = hoge.match(/>運<.*\s*.*?(\d+)/);

// console.log(power[1]);

const statusMap = {};

const src = document.body.innerHTML;
const newSrc = src.replace(/\s/g, "");
console.log(newSrc.match(/>力<.*?(\d+)/)[1]);
if (src) {
    const currentPower = newSrc.match(/>力<.*?(\d+)/);
    const currentIntelligence = newSrc.match(/>知能<.*?(\d+)/);
    const currentFaith = newSrc.match(/>信仰心<.*?(\d+)/);
    const currentVitality = newSrc.match(/>生命力<.*?(\d+)/);
    const currentDexterity = newSrc.match(/>器用さ<.*?(\d+)/);
    const currentSpeed = newSrc.match(/>速さ<.*?(\d+)/);
    const currentCharm = newSrc.match(/>魅力<.*?(\d+)/);
    const currentLuck = newSrc.match(/>運<.*?(\d+)/);

    statusMap.power = currentPower[1];
    statusMap.intelligence = currentIntelligence[1];
    statusMap.faith = currentFaith[1];
    statusMap.vitality = currentVitality[1];
    statusMap.dexterity = currentDexterity[1];
    statusMap.speed = currentSpeed[1];
    statusMap.charm = currentCharm[1];
    statusMap.luck = currentLuck[1];
}

console.log(statusMap);
