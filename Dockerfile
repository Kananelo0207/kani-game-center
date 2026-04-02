# Step 1: Use the official .NET 8 SDK to build your app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy everything and build the release version
COPY . ./
RUN dotnet publish "GAME-CENTER.sln" -c Release -o /app/publish

# Step 2: Use the lighter .NET runtime to actually run the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose the port Render uses
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Tell the server to start your specific API
ENTRYPOINT ["dotnet", "GameCenterApi.dll"]