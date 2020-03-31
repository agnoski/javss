const ageAndSexProbability =[
    {id: 0, ageRange: "0-4", pm: 0.514, pf: 0.486, pe: 0.040},
    {id: 1, ageRange: "5-9", pm: 0.514, pf: 0.486, pe: 0.046},
    {id: 2, ageRange: "10-14", pm: 0.515, pf: 0.485, pe: 0.047},
    {id: 3, ageRange: "15-19", pm: 0.519, pf: 0.481, pe: 0.048},
    {id: 4, ageRange: "20-24", pm: 0.521, pf: 0.479, pe: 0.049},
    {id: 5, ageRange: "25-29", pm: 0.511, pf: 0.489, pe: 0.054},
    {id: 6, ageRange: "30-34", pm: 0.504, pf: 0.496, pe: 0.056},
    {id: 7, ageRange: "35-39", pm: 0.501, pf: 0.499, pe: 0.063},
    {id: 8, ageRange: "40-44", pm: 0.498, pf: 0.502, pe: 0.075},
    {id: 9, ageRange: "45-49", pm: 0.495, pf: 0.505, pe: 0.080},
    {id: 10, ageRange: "50-54", pm: 0.492, pf: 0.508, pe: 0.081},
    {id: 11, ageRange: "55-59", pm: 0.486, pf: 0.514, pe: 0.071},
    {id: 12, ageRange: "60-64", pm: 0.481, pf: 0.519, pe: 0.062},
    {id: 13, ageRange: "65-69", pm: 0.476, pf: 0.524, pe: 0.059},
    {id: 14, ageRange: "70-74", pm: 0.466, pf: 0.534, pe: 0.051},
    {id: 15, ageRange: "75-79", pm: 0.444, pf: 0.556, pe: 0.046},
    {id: 16, ageRange: "80-84", pm: 0.410, pf: 0.590, pe: 0.035},
    {id: 17, ageRange: "85-89", pm: 0.353, pf: 0.647, pe: 0.022},
    {id: 18, ageRange: "90-94", pm: 0.281, pf: 0.719, pe: 0.010},
    {id: 19, ageRange: "95-99", pm: 0.218, pf: 0.782, pe: 0.002}
];

function probabilityArrayGenerator(inputArray, multFactor) {
    const outputArray = [];
    inputArray.forEach((prob, idx) => {
        const iterations = Math.floor(prob * multFactor);
        for(let i = 0; i < iterations; i++) {
            outputArray.push(idx);
        }
    });

    return outputArray;
}

function getValueFromProbabilityArray(probabilityArray) {
    const idx = Math.floor(Math.random() * probabilityArray.length);
    return probabilityArray[idx];
}

function isHappeningProbability(probability) {
    const rnd = Math.random();
    return rnd > probability ? true : false;
}

function getAge(probabilityData) {
    const pe = probabilityData.map(data => data.pe);

    const probabilityArray = probabilityArrayGenerator(pe, 1000);
    const ageIdx = getValueFromProbabilityArray(probabilityArray);
    const ageRange = probabilityData.filter(data => data.id === ageIdx)[0];

    return {ageIdx: ageIdx, ageRange: ageRange};
}

function getSexGivenAgeIdx(probabilityData, ageIdx) {
    const pm = probabilityData[ageIdx].pm;

    return isHappeningProbability(pm) ? "male": "female";
}

function test() {
    const n = 1000;
    const people = [];
    for(let i = 0; i < n; i++) {
        const age = getAge(ageAndSexProbability);
        const sex = getSexGivenAgeIdx(ageAndSexProbability, age.ageIdx);
        people.push({ageIdx: age.ageIdx, ageRange: age.ageRange, sex: sex});
    }

    const numMale = people.filter(person => person.sex === "male").length;
    const numFemale = people.filter(person => person.sex === "female").length;
    
    console.log(people);
    console.log(`Num male: ${numMale}`);
    console.log(`Num female: ${numFemale}`);

    for(let i = 0; i < ageAndSexProbability.length; i++) {
        const numPerIdx = people.filter(person => person.ageIdx === i).length
        console.log(`Num per idx ${i}: ${numPerIdx}`);
    }
}