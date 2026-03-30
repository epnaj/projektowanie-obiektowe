program BS;

const size = 50;
const range = 100;

type MyArray = array[1..size] of integer;

var liczby: MyArray;

procedure Generate(var arr: MyArray);
var i: integer;

begin
  Randomize;
  for i := 1 to size do
    arr[i] := Random(range + 1);
end;

procedure PrintArray(arr: MyArray);
var i: integer;

begin
  for i := 1 to size do
    write(arr[i], ' ');
  writeln;
end;

begin
  Generate(liczby);
  writeln('Numbers:');
  PrintArray(liczby);

end.