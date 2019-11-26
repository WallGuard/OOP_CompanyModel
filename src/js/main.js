class Director {

    constructor() {
        this.newProject = [];
        this.oldProject = [];
        this.hiredDevelopers = [];
        this.firedDevelopers = [];
        this.finishedProjects = [];
    }

    getProjects() {
        const projects = order.generateNewProjects();
        this.newProject = projects;
        return projects;
    }

    projectDistribution(oldProjects, newProjects) {
        this.oldProjectDistribution(oldProjects);
        this.newProjectDistribution(newProjects);
    }

    dismissionDeveloper(dismission, developers) {
        if (dismission.length) {
            dismission.sort(function (a, b) {
                if (a.value > b.value) { return 1; }
                if (a.value < b.value) { return -1; }
            });
            let devIndex = developers.findIndex(obj => obj.id === dismission[0].id);
            this.firedDevelopers.push(developers[devIndex]);
            developers.splice(devIndex, 1);
        }
        return this.firedDevelopers[this.firedDevelopers.length - 1];
    }

    oldProjectDistribution(oldProjects) {
        oldProjects.forEach((item) => {
            if ((item instanceof WebProject) && (!item.done)) {
                this.addDeveloper(item, web);
            }
            else if ((item instanceof MobileProject) && (!item.done)) {
                for (let j = 0; j < item.level; j++) {
                    this.addDeveloper(item, mobile);
                }
            } else {
                this.addDeveloper(item, qa);
            }
        })
        this.oldProject = [];
    }

    newProjectDistribution(newProjects) {
        let lostProjects = [];
        if (newProjects.length !== 0) {
            newProjects.forEach((project) => {
                if (project instanceof WebProject) {
                    let freeDeveloper = web.developers.find(obj => !obj.busyDay);
                    if (freeDeveloper) {
                        this.assignWebProject(freeDeveloper, project);
                    }
                    else {
                        lostProjects.push(project);
                    }
                }
                else {
                    let freeDeveloper = mobile.developers.filter(obj => !obj.busyDay);
                    if (freeDeveloper.length) {
                        this.assignMobileProject(freeDeveloper, project);
                    }
                    else {
                        lostProjects.push(project);
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
        this.hiredDevelopers.push(developer);

        developer.projects.push(oldProject);
        developer.daysOfPass = 0;

        if (department instanceof Web) {
            developer.busyDay = oldProject.level;
        }
        else {
            developer.busyDay = 1;
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
            if (item.busyDay == 0 && item.daysOfPass == 0) throw new Error('tada')
            if ((!item.busyDay) && (!item.daysOfPass)) {
                let finishedProject = item.projects[item.projects.length - 1];
                if (!finishedProject.done) {
                    finishedProject.done = true;
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
                director.finishedProjects.push(finishedProject);
            }
        })
        return director.finishedProjects[director.finishedProjects.length - 1];
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
        this.done = false;
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

class Order {

    generateNewProjects() {
        const projectCount = Math.floor(Math.random() * 5);
        let orderedProjects = [];

        for (let i = 0; i < projectCount; i++) {
            let project = null;
            const projectLevel = Math.floor(Math.random() * 3) + 1;
            const projectSpeciality = Math.round(Math.random());

            if (projectSpeciality) {
                project = new WebProject(projectLevel);
            }
            else {
                project = new MobileProject(projectLevel);
            }
            orderedProjects.push(project);
        }
        console.log(orderedProjects)
        return orderedProjects;
    }

}

class Statistic {

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

        const finishedProjects = director.finishedProjects.length;
        const hiredDevelopers = director.hiredDevelopers.length;
        const firedDevelopers = director.firedDevelopers.length;

        return {
            finishedProjects,
            hiredDevelopers,
            firedDevelopers
        }
    }
}

let statistic = new Statistic();
let order = new Order();
let director = new Director();
let web = new Web();
let mobile = new Mobile();
let qa = new QA();
Project.id = 0;
Developer.id = 0;

console.log(statistic.generate(12))
