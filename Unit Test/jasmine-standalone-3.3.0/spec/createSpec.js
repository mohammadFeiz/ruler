// a.toEqual(b)                   a==b
// a.toBe(b)                      a===b
// a.toBeTruthy()                 a===true
// a.toBeFalsy()                  a===false
// a.toContain(b)                 a.indexOf(b) !== -1    (a => array,b => any)
// a.roBeCloseTo(b,c)             Math.abs(a - b) <= c   (a = number, b => number, c = number)
// a.toMatch(b)                   a.indexOf(b) !== -1    (a => string,b => string)
// a.toBeDefined()                a !== undefined        (a => variable)
// a.toBeUndefined()              a === undefined        (a => variable)
// a.toBeNull()                   a === null             (a => variable)
// a.toBeGreaterThan(b)           a > b
// a.toBeLessThan(b)              a < b
// a.toBeNaN()
// a.toEqual(jasmine.any(String)) typeof a === "string"

describe("create",function() { 
    //test case: 1  
    it("getAutoWeldCoords", function () {
       expect(create.getAutoWeldCoords({x:0,y:0})).toEqual(jasmine.any(Object));  
    }); 
 }); 