test( "hello test", function() {
  equal( utils.elementWeight(document.getElementById("toTestWeight0")), 0);
  equal( utils.elementWeight(document.getElementById("toTestWeight1")), 1);
  equal( utils.elementWeight(document.getElementById("toTestWeight3")), 3);
  equal( utils.elementWeight(document.getElementById("toTestWeight4")), 4);
  equal( utils.elementWeight(document.getElementById("toTestWeight")), 11);
  equal( utils.elementWeight(document.getElementById("toTestWeight8")), 8);
  equal( utils.elementWeight(document.getElementById("toTestWeight14")), 14);
  equal( utils.elementWeight(document.getElementById("toTestWeight14"), 10), 11);
});