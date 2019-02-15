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

describe("create.getCoords()",function() {
   beforeEach(function(){
      Points.add({x:100,y:-100});
      create.autoWeldArea = 10;
   }); 
   it("اگر در محدوده یک نقطه کلیک شد باید مختصات آن نقطه برگردد", function () {
      expect(create.getCoords({x:109,y:-100})).toEqual({x:100,y:-100});  
   }); 
   it("اگر خارج از محدوده نقاط کلیک شد باید مختصات نقطه کلیک شده برگردد", function () {
      expect(create.getCoords({x:110,y:-100})).toEqual({x:110,y:-100});  
   }); 
   describe('',function() {
      beforeEach(function(){
         app.state.createmode.linesMethod = 'doubleRow';
      }); 
      it('اگر مد برنامه ساخت دابل لاین بود نقاط نا دیده گرفته می شوند و مختصات نقطه کلیک شده باز می گردد', function () {
         expect(create.getCoords({x:109,y:-100})).toEqual({x:109,y:-100});  
      }); 
   }); 
 }); 
