using Backend.Api.Controllers;
using Backend.Api.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ProjectDbContext>(
    (optional) => optional.UseNpgsql(builder.Configuration.GetConnectionString("ServerPostgreSql")));
builder.Services.AddCors();
builder.Services.AddSignalR();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(optional => optional
       .AllowAnyOrigin()
       .AllowAnyHeader()
       .AllowAnyMethod()
       .AllowCredentials()
       .WithOrigins("http://localhost:4200")  
);

app.UseHttpsRedirection();

app.UseRouting();

app.MapControllers();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<ChatHub>("/chat");
});

app.Run();