import { expect } from "chai";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        oneValidSection: "./test/data/oneValidSection.zip",
        multiValidSection: "./test/data/multiValidSection.zip",
        validAndInvalid: "./test/data/validAndInvalid.zip",
        noValidSection: "./test/data/noValidSection.zip",
        noFiles: "./test/data/noFiles.zip",
        wrongFormat: "./test/data/wrongFormat.zip",
        wrongName: "./test/data/wrongName.zip",
        cour__se: "./test/data/ cour__se.zip",
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
    });

    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // Sept. 10: testing cases to addDataset, removeDataset, listDataset  Q: list of dataset; independent dataset; merge
    // 1. add a dataset of only one valid section
    it("Should add one valid section dataset", function () {
        const id: string = "oneValidSection";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // 2. add a dataset of only one valid course w. multiple sections
    it("Should add a course with multiple sections", function () {
        const id: string = "multiValidSection";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // 3. add a dataset has an invalid course and a valid course
    it("Should add a dataset has an invalid course and a valid course", function () {
        const id: string = "validAndInvalid";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // 4. failed add a dataset with no valid section
    it("fail to add dataset w. no valid section", function () {
        const id: string = "noValidSection";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.be.instanceOf(InsightError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // 5. failed add a dataset with no files
    it("fail to add dataset w. no files", function () {
        const id: string = "noFiles";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.be.instanceOf(InsightError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // 6. failed wrong JSON format
    it("failed wrong JSON format", function () {
        const id: string = "wrongFormat";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.be.instanceOf(InsightError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // 7. wrong folder name
    it("failed wrong folder name", function () {
        const id: string = "wrongName";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.be.instanceOf(InsightError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // 8. failed added twice dataset w. same id
    it("added twice dataset w. same id", function () {
        const id: string = "oneValidSection";
        const expected: string[] = [id];
        insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.be.instanceOf(InsightError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // 9. failed since wrong dataset id
    it("failed w. wrong dataset id", function () {
        const id: string = "cour__se";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.be.instanceOf(InsightError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });

    // 10. remove a dataset success
    it("remove dataset success", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return insightFacade.removeDataset(id).then((result: string) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });

    // 11. failed w. not found id
    it("fail with not found id", function () {
        const id: string = "notfoundyet";
        const expected: string[] = [id];
        return insightFacade.removeDataset(id).then((result: string) => {
            expect(result).to.be.instanceOf(NotFoundError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });

    // 12. failed w. invalid id
    it("fail with not found id", function () {
        const id: string = "cour__se";
        const expected: string[] = [id];
        return insightFacade.removeDataset(id).then((result: string) => {
            expect(result).to.be.instanceOf(InsightError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });

    // 13. failed w. invalid id blank
    it("fail with blank", function () {
        const id: string = "  ";
        const expected: string[] = [id];
        return insightFacade.removeDataset(id).then((result: string) => {
            expect(result).to.be.instanceOf(InsightError);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: any } = {
        courses: {id: "courses", path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
    };
    let insightFacade: InsightFacade = new InsightFacade();
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        for (const key of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[key];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(ds.id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             * For D1, remove this catch block (but keep the Promise.all)
             */
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function (done) {
                    insightFacade.performQuery(test.query).then((result) => {
                        TestUtil.checkQueryResult(test, result, done);
                    }).catch((err) => {
                        TestUtil.checkQueryResult(test, err, done);
                    });
                });
            }
        });
    });
});
