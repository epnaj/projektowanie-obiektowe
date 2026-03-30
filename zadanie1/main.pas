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

procedure BubbleSort(var arr: MyArray);
var i, j, temp: integer;

begin
  for i := 1 to size - 1 do
    for j := 1 to size - i do
      if arr[j] > arr[j + 1] then
      begin
        temp := arr[j];
        arr[j] := arr[j + 1];
        arr[j + 1] := temp;
      end;
end;

begin
  Generate(liczby);
  writeln('Numbers:');
  PrintArray(liczby);

  BubbleSort(liczby);
  writeln('Sorted:');
  PrintArray(liczby);
end.