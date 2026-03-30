program BS;

{ const size = 50; }
{ const range = 100; }

uses Algo;

procedure PrintArray(arr: MyArray);
var i: integer;

begin
  for i := 0 to Length(arr) - 1 do
    write(arr[i], ' ');
  writeln;
end;

var liczby: MyArray;
begin
  Generate(liczby, 3, 10, 21);
  writeln('Numbers:');
  PrintArray(liczby);

  BubbleSort(liczby);
  writeln('Sorted:');
  PrintArray(liczby);
end.