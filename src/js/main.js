class Director {

    constructor() {
        this.newProject = [];
        this.oldProject = [];
        this.paidDeveloper = [];
        this.firedDeveloper = [];
        this.finishedProject = [];
    }

    getProjects() {
        const projects = customer.generateNewProjects();
        this.newProject = projects;
        return projects;
    }

    projectDistribution(oldProjects, newProjects) {
        if (oldProjects.length) {
            this.oldProjectDistribution(oldProjects);
            this.newProjectDistribution(newProjects);
        }
        else {
            this.newProjectDistribution(newProjects);
        }
    }

    dismissionDeveloper(dismission, developers) {
        if (dismission.length) {
            if (dismission.length === 1) {
                let devIndex = developers.findIndex(obj => obj.id === dismission[0].id);
                this.firedDeveloper.push(developers[devIndex]);
                developers.splice(devIndex, 1);
            }
            else {
                dismission.sort(function (a, b) {
                    if (a.value > b.value) { return 1; }
                    if (a.value < b.value) { return -1; }
                });
                let devIndex = developers.findIndex(obj => obj.id === dismission[0].id);
                this.firedDeveloper.push(developers[devIndex]);
                developers.splice(devIndex, 1);
            }
        }
        return this.firedDeveloper[this.firedDeveloper.length - 1];
    }

    oldProjectDistribution(oldProjects) {
        oldProjects.forEach((item) => {
            if ((item instanceof WebProject) && (!item.development)) {
                this.addDeveloper(item, web);
            }
            else if ((item instanceof MobileProject) && (!item.development)) {
                for (let j = 0; j < item.level; j++) {
                    this.addDeveloper(item, mobile);
                }
            } else {
                this.addDeveloper(item, qa);
            }
        })
        oldProjects.splice(0, oldProjects.length);
        this.oldProject = oldProjects;
    }

    newProjectDistribution(newProjects) {
        let lostProjects = [];
        if (newProjects.length !== 0) {
            newProjects.forEach((item) => {
                if (item instanceof WebProject) {
                    let freeDeveloper = web.developers.find(obj => !obj.busyDay);
                    if (freeDeveloper) {
                        this.assignWebProject(freeDeveloper, item);
                    }
                    else {
                        lostProjects.push(item);
                    }
                }
                else {
                    let freeDeveloper = mobile.developers.filter(obj => !obj.busyDay);
                    if (freeDeveloper.length) {
                        this.assignMobileProject(freeDeveloper, item);
                    }
                    else {
                        lostProjects.push(item);
                    }
                }
            })
        }
        this.oldProject = lostProjects;
        return lostProjects;
    }

    addDeveloper(oldProject, department) {
        let developer = null;
        if (department instanceof Web) {
            developer = new WebDeveloper();
        }
        else if (department instanceof Mobile) {
            developer = new MobileDeveloper();
        }
        else {
            developer = new QADeveloper();
        }
        department.developers.push(developer);
        this.paidDeveloper.push(department.developers[department.developers.length - 1]);
        let lastElem = department.developers.length - 1;
        department.developers[lastElem].projects.push(oldProject);
        department.developers[lastElem].daysOfPass = 0;

        if (department instanceof Web) {
            department.developers[lastElem].busyDay = oldProject.level;
        }
        else {
            department.developers[lastElem].busyDay = 1;
        }
    }

    assignWebProject(freeDeveloper, newProject) {
        freeDeveloper.projects.push(newProject);
        freeDeveloper.busyDay = newProject.level;
        freeDeveloper.daysOfPass = 0;
    }

    assignMobileProject(freeDeveloper, newProject) {
        if (freeDeveloper.length >= newProject.level) {
            let needDevs = freeDeveloper.splice(0, newProject.level);
            needDevs.forEach((item) => {
                item.projects.push(newProject);
                item.busyDay = 1;
                item.daysOfPass = 0;
            })
        } else {
            const developer = freeDeveloper[0];
            developer.projects.push(newProject);
            developer.busyDay = newProject.level;
            developer.daysOfPass = 0;
        }
    }
}

class Department {
    constructor() {
        this.developers = [];
    }

    developmentCompleted(developers) {
        let finishedProjects = [];
        developers.forEach((item) => {
            if ((!item.busyDay) && (!item.daysOfPass)) {
                let finishedProject = item.projects[item.projects.length - 1];
                if (!finishedProject.development) {
                    finishedProject.development = true;
                    let freeDeveloper = qa.developers.find(obj => !obj.busyDay);
                    if (freeDeveloper) {
                        freeDeveloper.projects.push(finishedProject);
                        freeDeveloper.busyDay = 1;
                        freeDeveloper.daysOfPass = 0;
                    }
                    else {
                        director.oldProject.push(finishedProject);
                    }
                }
                finishedProjects.push(finishedProject);
            }
        })
        return finishedProjects;
    }

    projectCompleted(developers) {
        developers.forEach((item) => {
            if ((!item.busyDay) && (!item.daysOfPass)) {
                let finishedProject = item.projects[item.projects.length - 1];
                director.finishedProject.push(finishedProject);
            }
        })
        return director.finishedProject[director.finishedProject.length - 1];
    }

    dayFinished(developers) {
        let dismission = [];
        const maxDaysOfPass = 3;
        developers.forEach((item) => {
            if (item.busyDay) {
                item.busyDay -= 1;
            }
            else {
                item.daysOfPass += 1;
            }
            if (item.daysOfPass > maxDaysOfPass) {
                dismission.push(item);
            }
        })
        director.dismissionDeveloper(dismission, developers);
        return dismission;
    }

}

class Web extends Department { }
class Mobile extends Department { }
class QA extends Department { }

class Developer {
    constructor() {
        this.id = ++Developer.id;
        this.projects = [];
        this.busyDay = 0;
        this.daysOfPass = 0;
    }

}

class WebDeveloper extends Developer { }

class MobileDeveloper extends Developer { }

class QADeveloper extends Developer { }

class Project {
    constructor() {
        this.id = ++Project.id;
        this.development = false;
    }
}

class WebProject extends Project {
    constructor(level) {
        super(level);
        this.level = level;
    }
}

class MobileProject extends Project {
    constructor(level) {
        super(level);
        this.level = level;
    }
}

class Customer {

    generateNewProjects() {
        const minCount = 0;
        const maxCount = 4;
        const needProjectCount = Math.floor(minCount + Math.random() * (maxCount + 1 - minCount));
        let needProjects = [];

        for (let i = 0; i < needProjectCount; i++) {
            let project = null;
            const minLevel = 1;
            const maxLevel = 3;
            const projectLevel = Math.floor(minLevel + Math.random() * (maxLevel + 1 - minLevel));
            const projectSpeciality = Math.round(Math.random());

            if (projectSpeciality) {
                project = new WebProject(projectLevel);
            }
            else {
                project = new MobileProject(projectLevel);
            }
            needProjects.push(project);
        }
        return needProjects;
    }

}

class Statistics {
    
    generate(days) {
        for (let i = 0; i < days; i++) {
            let newProjects = director.getProjects();
            let oldProjects = director.oldProject;
            director.projectDistribution(oldProjects, newProjects);

            web.dayFinished(web.developers);
            mobile.dayFinished(mobile.developers);
            qa.dayFinished(qa.developers);

            qa.projectCompleted(qa.developers);
            web.developmentCompleted(web.developers);
            mobile.developmentCompleted(mobile.developers);
        }

        const finishedProjects = director.finishedProject.length;
        const paidDeveloper = director.paidDeveloper.length;
        const firedDeveloper = director.firedDeveloper.length;

        console.log(
        `        Количество дней: ${days}
        Реализовано проектов: ${finishedProjects}
        Нанято программистов: ${paidDeveloper}
        Уволено программистов: ${firedDeveloper}`);

        return {
            finishedProjects,
            paidDeveloper,
            firedDeveloper
        }
    }
}

let statistics = new Statistics();
let customer = new Customer();
let director = new Director();
let web = new Web();
let mobile = new Mobile();
let qa = new QA();
Project.id = 0;
Developer.id = 0;

statistics.generate(3);
