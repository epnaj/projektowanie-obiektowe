program BS;

{ const size = 50; }
{ const range = 100; }

type MyArray = array of integer;

var liczby: MyArray;

procedure Generate(var arr: MyArray; range_l, range_r, n: integer);
var i: integer;

begin
  SetLength(arr, n);
  Randomize;
  for i := 0 to n - 1 do
    arr[i] := Random(range_r - range_l + 1) + range_l;
end;

procedure PrintArray(arr: MyArray);
var i: integer;

begin
  for i := 0 to Length(arr) - 1 do
    write(arr[i], ' ');
  writeln;
end;

procedure BubbleSort(var arr: MyArray);
var i, j, temp: integer;

begin
  for i := 0 to Length(arr) - 2 do
    for j := 0 to Length(arr) - i - 2 do
      if arr[j] > arr[j + 1] then
      begin
        temp := arr[j];
        arr[j] := arr[j + 1];
        arr[j + 1] := temp;
      end;
end;

begin
  Generate(liczby, 3, 10, 21);
  writeln('Numbers:');
  PrintArray(liczby);

  BubbleSort(liczby);
  writeln('Sorted:');
  PrintArray(liczby);
end.